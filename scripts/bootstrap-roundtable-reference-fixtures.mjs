import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importerPath = path.join(__dirname, "import-roundtable-reference.mjs");
const robertFixture = path.join(__dirname, "fixtures/reference-robert-llm-data.sample.jsonl");
const zhihuFixture = path.join(__dirname, "fixtures/reference-zhihu-kol.sample.json");
const tiebaFixture = path.join(
  __dirname,
  "fixtures/reference-baidu-tieba-sunxiaochuan.sample.jsonl",
);

function runImporter(args) {
  execFileSync(process.execPath, [importerPath, ...args], {
    stdio: "inherit",
  });
}

runImporter(["--source", "robert-llm-data", "--input", robertFixture, "--limit", "50"]);
runImporter(["--source", "zhihu-kol", "--input", zhihuFixture, "--limit", "50"]);
runImporter([
  "--source",
  "baidu-tieba-sunxiaochuan",
  "--input",
  tiebaFixture,
  "--limit",
  "50",
]);
