import type { ExperimentRecord, ExperimentState } from "./experiment-engine";
import { resolveExperimentState } from "./experiment-engine";
import { mockExperiments } from "./mock-experiments";

const STORAGE_KEY = "agent-hub:experiments";

function canUseStorage(storage: Storage | undefined): storage is Storage {
  return typeof window !== "undefined" && !!storage;
}

function readStore(storage = typeof window !== "undefined" ? window.localStorage : undefined) {
  if (!canUseStorage(storage)) {
    return {};
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function saveExperimentRecord(
  record: ExperimentRecord,
  storage = typeof window !== "undefined" ? window.localStorage : undefined,
) {
  if (!canUseStorage(storage)) {
    return;
  }

  const store = readStore(storage);

  storage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...store,
      [record.id]: record,
    }),
  );
}

export function readExperimentState(
  id: string,
  storage = typeof window !== "undefined" ? window.localStorage : undefined,
): ExperimentState {
  const store = readStore(storage);
  const stored = store[id];

  if (stored) {
    return resolveExperimentState(stored);
  }

  if (mockExperiments[id]) {
    return resolveExperimentState(mockExperiments[id]);
  }

  return {
    kind: "missing",
    message: "这次实验没有产出有效结论，建议回到首页重新运行。",
  };
}
