import { redirect } from "next/navigation";

export default function LegacyEntityDetailPage({ params }: { params: { slug: string } }) {
  redirect(`/growth/entities/${params.slug}`);
}
