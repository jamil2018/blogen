import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicationPageView from "../../../../components/pages/PublicationPageView";
import { getPublicationArchive } from "../../../../actions/publications";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; section?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicationArchive(slug, 1);
  if (!data) return { title: "Publication · Blogen" };
  return {
    title: `${data.publication.name} · Blogen`,
    description:
      data.publication.tagline ||
      data.publication.description ||
      `Stories from ${data.publication.name}`,
  };
}

export default async function PublicationPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const data = await getPublicationArchive(slug, page, sp.section);
  if (!data) notFound();

  return (
    <PublicationPageView
      publication={data.publication}
      sections={data.sections}
      activeSection={data.section}
      posts={data.posts.data}
      page={data.posts.page}
      totalPages={data.posts.totalPages}
    />
  );
}
