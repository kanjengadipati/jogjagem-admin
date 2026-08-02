/**
 * Pass-through layout for /business/[externalId]/* routes.
 * The sidebar is already provided by the parent layout at
 * /business/layout.tsx — DO NOT add sidebar here or it will double.
 */
export default function BusinessExternalIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
