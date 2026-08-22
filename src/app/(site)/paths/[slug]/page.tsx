import ReadingPathPageView from "../../../../components/pages/ReadingPathPageView";

export default async function ReadingPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ReadingPathPageView slug={slug} />;
}
