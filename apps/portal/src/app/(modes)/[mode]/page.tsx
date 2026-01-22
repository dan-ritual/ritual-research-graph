import { redirect } from "next/navigation";

interface ModeIndexPageProps {
  params: Promise<{ mode: string }>;
}

export default async function ModeIndexPage({ params }: ModeIndexPageProps) {
  const { mode } = await params;
  redirect(`/${mode}/dashboard`);
}
