import { redirect } from "next/navigation";

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const { mdxPath = [] } = await props.params;
  redirect(`/fr/docs${mdxPath.length ? `/${mdxPath.join("/")}` : ""}`);
}
