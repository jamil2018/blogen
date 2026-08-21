import PageHero from "../layout/PageHero";

type PolicySection = {
  heading: string;
  body: string;
};

export default function PolicyPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: PolicySection[];
}) {
  return (
    <article className="mx-auto max-w-3xl">
      <PageHero
        title={title}
        description={`Last updated ${updated}`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: title }]}
      />
      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {section.heading}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
