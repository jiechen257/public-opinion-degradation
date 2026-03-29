import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  deletePersonaExamplesForSource,
  insertPersonaExamples,
  insertSources,
  openCorpusDatabase,
  projectRoot,
  resetCorpusDatabaseFromSeed,
  sqlitePath,
  writeCorpusSnapshot,
} from "./lib/roundtable-corpus-db.mjs";
import { mapReferenceRecordToPersonaExample } from "../src/features/experiments/roundtable-corpus-import.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const builtInSources = {
  "robert-llm-data": {
    source: {
      id: "reference-robert-llm-data",
      platform: "Weibo",
      sourceType: "reference-dataset",
      title: "robert-llm-data",
      url: "https://huggingface.co/datasets/Chishui-Chen/robert-llm-data",
      licenseNote: "apache-2.0",
      notes: "通过 Hugging Face 单文件 JSONL 导入评论风格语料。",
    },
    dataUrl:
      "https://huggingface.co/datasets/Chishui-Chen/robert-llm-data/resolve/main/sft_data.jsonl?download=true",
  },
  "zhihu-kol": {
    source: {
      id: "reference-zhihu-kol",
      platform: "Zhihu",
      sourceType: "reference-dataset",
      title: "Zhihu-KOL",
      url: "https://huggingface.co/datasets/wangrui6/Zhihu-KOL",
      licenseNote: "OpenAssistant",
      notes:
        "数据页显示主要字段为 INSTRUCTION / RESPONSE / SOURCE / METADATA；当前脚本支持导入本地导出的 JSON 或 JSONL。",
    },
    dataUrl: null,
  },
  "baidu-tieba-sunxiaochuan": {
    source: {
      id: "reference-baidu-tieba-sunxiaochuan",
      platform: "Baidu Tieba",
      sourceType: "reference-dataset",
      title: "Baidu_Tieba_SunXiaochuan",
      url: "https://huggingface.co/datasets/Orphanage/Baidu_Tieba_SunXiaochuan",
      licenseNote: "待后续核验",
      notes:
        "贴吧风格参考源，当前脚本支持导入本地导出的 JSON 或 JSONL。",
    },
    dataUrl: null,
  },
};

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    index += 1;
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/import-roundtable-reference.mjs --source robert-llm-data [--limit 80]
  node scripts/import-roundtable-reference.mjs --source zhihu-kol --input <local-json-or-jsonl> [--limit 80]
  node scripts/import-roundtable-reference.mjs --source baidu-tieba-sunxiaochuan --input <local-json-or-jsonl> [--limit 80]
  node scripts/import-roundtable-reference.mjs --url <jsonl-url> --source-id <id> --title <title>
  node scripts/import-roundtable-reference.mjs --input <local-jsonl-or-json> --source-id <id> --title <title>
`);
}

function resolveSourceMeta(args) {
  if (typeof args.source === "string" && builtInSources[args.source]) {
    return builtInSources[args.source];
  }

  if (!args["source-id"]) {
    throw new Error("自定义导入需要提供 --source-id。");
  }

  return {
    source: {
      id: String(args["source-id"]),
      platform: typeof args.platform === "string" ? args.platform : "unknown",
      sourceType: "reference-import",
      title: typeof args.title === "string" ? args.title : String(args["source-id"]),
      url: typeof args.url === "string" ? args.url : null,
      licenseNote: typeof args.license === "string" ? args.license : "unknown",
      notes:
        typeof args.notes === "string"
          ? args.notes
          : "通过 roundtable reference importer 导入。",
    },
    dataUrl: typeof args.url === "string" ? args.url : null,
  };
}

function parseRecordBatch(raw) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [];
  }

  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

async function readInputRecords(args, resolvedSource) {
  if (typeof args.input === "string") {
    const localPath = path.isAbsolute(args.input)
      ? args.input
      : path.resolve(projectRoot, args.input);
    return parseRecordBatch(readFileSync(localPath, "utf8"));
  }

  const dataUrl = typeof args.url === "string" ? args.url : resolvedSource.dataUrl;

  if (!dataUrl) {
    throw new Error("该内置 source 没有可直接拉取的 JSONL，请改用 --input 本地导出文件或手动提供 --url。");
  }

  const response = await fetch(dataUrl);

  if (!response.ok) {
    throw new Error(`下载语料失败：${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseRecordBatch(text);
}

function buildImportedExamples(records, sourceId, limit) {
  const examples = [];
  const seenText = new Set();

  for (let index = 0; index < records.length; index += 1) {
    const example = mapReferenceRecordToPersonaExample({
      record: records[index],
      sourceId,
      index,
    });

    if (!example || seenText.has(example.text)) {
      continue;
    }

    seenText.add(example.text);
    examples.push(example);

    if (examples.length >= limit) {
      break;
    }
  }

  return examples;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  const resolvedSource = resolveSourceMeta(args);
  const limit = Math.max(1, Number.parseInt(String(args.limit ?? "80"), 10) || 80);

  if (!existsSync(sqlitePath)) {
    resetCorpusDatabaseFromSeed();
  }

  const records = await readInputRecords(args, resolvedSource);
  const examples = buildImportedExamples(records, resolvedSource.source.id, limit);

  if (examples.length === 0) {
    throw new Error("没有筛出可用样本，请换一个输入源或调小过滤条件。");
  }

  const db = openCorpusDatabase();

  try {
    insertSources(db, [resolvedSource.source]);
    deletePersonaExamplesForSource(db, resolvedSource.source.id);
    insertPersonaExamples(db, examples);
    const snapshot = writeCorpusSnapshot(db);

    console.log(
      `Imported ${examples.length} examples from ${resolvedSource.source.id} -> ${path.relative(projectRoot, sqlitePath)}`,
    );
    console.log(`Snapshot now contains ${snapshot.exampleCount} examples in total.`);
  } finally {
    db.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
