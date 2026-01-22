import { redirect } from "next/navigation";

export default function LegacyMicrositeDetailPage({ params }: { params: { slug: string } }) {
  redirect(`/growth/microsites/${params.slug}`);
}
