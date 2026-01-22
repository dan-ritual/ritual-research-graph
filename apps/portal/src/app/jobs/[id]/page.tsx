import { redirect } from "next/navigation";

export default function LegacyJobStatusPage({ params }: { params: { id: string } }) {
  redirect(`/growth/jobs/${params.id}`);
}
