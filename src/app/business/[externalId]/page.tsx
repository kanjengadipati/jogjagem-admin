import { redirect } from "next/navigation";

export default async function BusinessExternalIdPage({
  params,
}: {
  params: Promise<{ externalId: string }>;
}) {
  const { externalId } = await params;
  redirect(`/business/${externalId}/dashboard`);
}
