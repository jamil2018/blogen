export type ExploreFilters = {
  q?: string;
  categories: string[];
  tag?: string;
  authors: string[];
  sort: "newest" | "oldest";
  page: number;
};

function parseMultiValue(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap((entry) => entry.split(",")).map((entry) => entry.trim()).filter(Boolean);
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function arraysEqual(a: string[], b: string[]): boolean {
  const left = uniqueSorted(a);
  const right = uniqueSorted(b);
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export function filtersFromSearchParams(
  params: Pick<URLSearchParams, "get" | "getAll">,
): ExploreFilters {
  const sort = params.get("sort") === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(params.get("page")) || 1);

  return {
    q: params.get("q")?.trim() || undefined,
    categories: uniqueSorted(params.getAll("category")),
    tag: params.get("tag")?.trim() || undefined,
    authors: uniqueSorted(params.getAll("author")),
    sort,
    page,
  };
}

export function filtersFromRecord(
  params: Record<string, string | string[] | undefined>,
): ExploreFilters {
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  return {
    q: typeof params.q === "string" ? params.q.trim() || undefined : undefined,
    categories: uniqueSorted(parseMultiValue(params.category)),
    tag: typeof params.tag === "string" ? params.tag.trim() || undefined : undefined,
    authors: uniqueSorted(parseMultiValue(params.author)),
    sort,
    page,
  };
}

export function exploreFiltersToParams(filters: ExploreFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  filters.categories.forEach((category) => params.append("category", category));
  if (filters.tag) params.set("tag", filters.tag);
  filters.authors.forEach((author) => params.append("author", author));
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params;
}

export function exploreFiltersEqual(a: ExploreFilters, b: ExploreFilters): boolean {
  return (
    a.page === b.page &&
    a.sort === b.sort &&
    (a.q ?? "") === (b.q ?? "") &&
    arraysEqual(a.categories, b.categories) &&
    (a.tag ?? "") === (b.tag ?? "") &&
    arraysEqual(a.authors, b.authors)
  );
}

export function hasAdvancedFilters(filters: ExploreFilters): boolean {
  return Boolean(
    filters.categories.length ||
      filters.tag ||
      filters.authors.length ||
      filters.sort !== "newest",
  );
}

export function listFiltersFromExplore(filters: ExploreFilters) {
  return {
    q: filters.q,
    categories: filters.categories,
    tag: filters.tag,
    authors: filters.authors,
    sort: filters.sort,
  };
}

export function emptyExploreFilters(): ExploreFilters {
  return { page: 1, sort: "newest", categories: [], authors: [] };
}
