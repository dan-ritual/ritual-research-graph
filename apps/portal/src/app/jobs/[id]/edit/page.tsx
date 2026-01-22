import { redirect } from "next/navigation";

export default function LegacyEditArtifactsPage({ params }: { params: { id: string } }) {
  redirect(`/growth/jobs/${params.id}/edit`);
}
