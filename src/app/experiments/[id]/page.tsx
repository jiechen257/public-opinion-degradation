import { notFound } from "next/navigation";
import { ExperimentReport } from "@/features/experiments/experiment-report";
import { mockExperiments } from "@/features/experiments/mock-experiments";

export function generateStaticParams() {
  return Object.keys(mockExperiments).map((id) => ({ id }));
}

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = mockExperiments[id];

  if (!experiment) {
    notFound();
  }

  return <ExperimentReport experiment={experiment} />;
}
