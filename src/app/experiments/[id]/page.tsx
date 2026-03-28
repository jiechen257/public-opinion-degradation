import { ExperimentReportShell } from "@/features/experiments/experiment-report";

export default async function ExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ExperimentReportShell experimentId={id} />;
}
