import { projectRoot, resetCorpusDatabaseFromSeed, sqlitePath, snapshotPath } from "./lib/roundtable-corpus-db.mjs";
import path from "node:path";

resetCorpusDatabaseFromSeed();

console.log(
  `Built roundtable corpus -> ${path.relative(projectRoot, sqlitePath)}`,
);
console.log(
  `Exported front-end snapshot -> ${path.relative(projectRoot, snapshotPath)}`,
);
