import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectRoot = path.resolve(__dirname, "../..");
export const seedPath = path.join(
  projectRoot,
  "src/features/experiments/roundtable-corpus.seed.json",
);
export const dataDir = path.join(projectRoot, "data");
export const sqlitePath = path.join(dataDir, "roundtable-corpus.sqlite");
export const snapshotPath = path.join(
  projectRoot,
  "src/features/experiments/roundtable-corpus.generated.json",
);

export function loadSeed() {
  return JSON.parse(readFileSync(seedPath, "utf8"));
}

export function initializeCorpusDatabase(db) {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      source_type TEXT NOT NULL,
      title TEXT NOT NULL,
      url TEXT,
      license_note TEXT NOT NULL,
      notes TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS persona_examples (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL REFERENCES sources(id),
      persona_id TEXT NOT NULL,
      dominant_action TEXT NOT NULL,
      featured_topic_ids TEXT NOT NULL,
      topic_tags TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      text TEXT NOT NULL
    );
  `);
}

export function openCorpusDatabase() {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(sqlitePath);
  initializeCorpusDatabase(db);
  return db;
}

export function resetCorpusDatabaseFromSeed() {
  const seed = loadSeed();

  mkdirSync(dataDir, { recursive: true });
  rmSync(sqlitePath, { force: true });

  const db = new DatabaseSync(sqlitePath);

  try {
    initializeCorpusDatabase(db);
    insertSources(db, seed.sources ?? []);
    insertPersonaExamples(db, seed.personaExamples ?? []);
    writeCorpusSnapshot(db);
  } finally {
    db.close();
  }
}

export function insertSources(db, sources) {
  const insertSource = db.prepare(`
    INSERT INTO sources (
      id,
      platform,
      source_type,
      title,
      url,
      license_note,
      notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      platform = excluded.platform,
      source_type = excluded.source_type,
      title = excluded.title,
      url = excluded.url,
      license_note = excluded.license_note,
      notes = excluded.notes
  `);

  for (const source of sources) {
    insertSource.run(
      source.id,
      source.platform,
      source.sourceType,
      source.title,
      source.url,
      source.licenseNote,
      source.notes,
    );
  }
}

export function insertPersonaExamples(db, examples) {
  const insertExample = db.prepare(`
    INSERT INTO persona_examples (
      id,
      source_id,
      persona_id,
      dominant_action,
      featured_topic_ids,
      topic_tags,
      intensity,
      text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      source_id = excluded.source_id,
      persona_id = excluded.persona_id,
      dominant_action = excluded.dominant_action,
      featured_topic_ids = excluded.featured_topic_ids,
      topic_tags = excluded.topic_tags,
      intensity = excluded.intensity,
      text = excluded.text
  `);

  for (const example of examples) {
    insertExample.run(
      example.id,
      example.sourceId,
      example.personaId,
      example.dominantAction,
      JSON.stringify(example.featuredTopicIds ?? []),
      JSON.stringify(example.topicTags ?? []),
      example.intensity,
      example.text,
    );
  }
}

export function deletePersonaExamplesForSource(db, sourceId) {
  db.prepare(`DELETE FROM persona_examples WHERE source_id = ?`).run(sourceId);
}

export function readCorpusSnapshot(db) {
  const exportedSources = db
    .prepare(
      `
        SELECT
          id,
          platform,
          source_type AS sourceType,
          title,
          url,
          license_note AS licenseNote,
          notes
        FROM sources
        ORDER BY id
      `,
    )
    .all();

  const exportedExamples = db
    .prepare(
      `
        SELECT
          id,
          source_id AS sourceId,
          persona_id AS personaId,
          dominant_action AS dominantAction,
          featured_topic_ids AS featuredTopicIds,
          topic_tags AS topicTags,
          intensity,
          text
        FROM persona_examples
        ORDER BY persona_id, dominant_action, id
      `,
    )
    .all()
    .map((row) => ({
      ...row,
      featuredTopicIds: JSON.parse(row.featuredTopicIds),
      topicTags: JSON.parse(row.topicTags),
    }));

  return {
    version: "2026-03-29",
    generatedAt: new Date().toISOString(),
    sqlitePath: path.relative(projectRoot, sqlitePath),
    sourceCount: exportedSources.length,
    exampleCount: exportedExamples.length,
    sources: exportedSources,
    personaExamples: exportedExamples,
  };
}

export function writeCorpusSnapshot(db) {
  const snapshot = readCorpusSnapshot(db);
  writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  return snapshot;
}
