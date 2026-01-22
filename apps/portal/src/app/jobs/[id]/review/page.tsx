import { redirect } from "next/navigation";

export default function LegacyEntityReviewPage({ params }: { params: { id: string } }) {
  redirect(`/growth/jobs/${params.id}/review`);
}
