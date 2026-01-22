import { redirect } from "next/navigation";

export default function LegacyPipelineDetailPage({ params }: { params: { id: string } }) {
  redirect(`/growth/pipeline/${params.id}`);
}
