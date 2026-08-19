"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Eye,
  MagnifyingGlass,
  PencilSimple,
  PenNib,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import {
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  Spinner,
  Table,
  Toast,
  toast,
} from "@heroui/react";
import ErrorState from "../feedback/ErrorState";
import EmptyState from "../feedback/EmptyState";
import {
  getAllPosts,
  getMyPosts,
  deleteMultiplePostsById,
} from "../../data/postQueryFunctions";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import type { Post } from "../../types";
import { selectionToIds } from "../../lib/selection";
import { cn } from "../../lib/cn";
import {
  calculateReadingTime,
  convertToText,
} from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";

type PostsTableViewProps = {
  basePath: string;
  requireAdmin?: boolean;
  filterByAuthor?: boolean;
};

function categoryTitle(post: Post): string {
  if (typeof post.category === "object") return post.category.title;
  if (typeof post.category === "string" && post.category) return post.category;
  return "Uncategorized";
}

function authorName(post: Post): string {
  if (typeof post.author === "object") return post.author.name;
  return "Unknown";
}

export default function PostsTableView({
  basePath,
  requireAdmin = false,
  filterByAuthor = false,
}: PostsTableViewProps) {
  void requireAdmin;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[]>([]);

  const { data, isLoading, isError } = useQuery({
    queryKey: [POST_DATA, { filterByAuthor }],
    queryFn: filterByAuthor ? getMyPosts : getAllPosts,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });

  const { data: categories } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMultiplePostsById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POST_DATA] });
      setSelected([]);
      setDeleteTarget([]);
      setDeleteOpen(false);
      toast("Post(s) deleted", { variant: "success" });
    },
  });

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      toast("Post created", { variant: "success" });
      router.replace(pathname);
    }
    if (searchParams.get("edited") === "1") {
      toast("Post updated", { variant: "success" });
      router.replace(pathname);
    }
  }, [pathname, router, searchParams]);

  const rows = useMemo(() => {
    if (!data) return [];
    let posts = data as Post[];

    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (categoryFilter !== "all") {
      posts = posts.filter((p) => categoryTitle(p) === categoryFilter);
    }

    return posts;
  }, [data, search, categoryFilter]);

  const openDelete = (ids: string[]) => {
    setDeleteTarget(ids);
    setDeleteOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) return <ErrorState />;

  const hasPosts = (data as Post[] | undefined)?.length;

  return (
    <div className="space-y-4">
      <Toast.Provider placement="bottom end" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="mt-1 text-sm text-muted">
            Manage drafts, publish updates, and review performance.
          </p>
        </div>
        <Link href={`${basePath}/create`}>
          <Button className="rounded-full" size="sm">
            <Plus className="mr-1 size-4" />
            Create
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search posts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          selectedKey={categoryFilter}
          onSelectionChange={(key) =>
            setCategoryFilter(key ? String(key) : "all")
          }
          className="w-full sm:w-48"
        >
          <Label className="sr-only">Category</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBoxItem id="all" textValue="All categories">
                All categories
              </ListBoxItem>
              {(categories ?? []).map((cat) => (
                <ListBoxItem key={cat.id} id={cat.title} textValue={cat.title}>
                  {cat.title}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {selected.length > 0 ? (
          <p className="text-sm text-muted">
            {selected.length} selected
          </p>
        ) : null}
      </div>

      {!hasPosts ? (
        <EmptyState
          title="No stories yet"
          description="Your archive is empty. Start writing and your posts will appear here."
        >
          <Link href={`${basePath}/create`}>
            <Button className="rounded-full">
              <PenNib className="mr-2 size-4" />
              Write your first story
            </Button>
          </Link>
        </EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No matching posts"
          description="Try adjusting your search or category filter."
        />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="Posts"
              selectionMode="multiple"
              selectedKeys={new Set(selected)}
              onSelectionChange={(keys) =>
                setSelected(selectionToIds(keys, rows.map((p) => p.id)))
              }
            >
              <Table.Header>
                <Table.Column isRowHeader>Post</Table.Column>
                {!filterByAuthor ? (
                  <Table.Column>Author</Table.Column>
                ) : null}
                <Table.Column>Category</Table.Column>
                <Table.Column>Published</Table.Column>
                <Table.Column>Read time</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>
              <Table.Body items={rows}>
                {(post: Post) => {
                  const readMinutes = calculateReadingTime(
                    convertToText(post.description)
                  );
                  return (
                    <Table.Row id={post.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {post.imageURL ? (
                            <img
                              src={post.imageURL}
                              alt=""
                              className="size-12 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="size-12 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium">{post.title}</p>
                            {post.tags?.length ? (
                              <p className="line-clamp-1 text-xs text-muted">
                                {post.tags.slice(0, 3).join(", ")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </Table.Cell>
                      {!filterByAuthor ? (
                        <Table.Cell>{authorName(post)}</Table.Cell>
                      ) : null}
                      <Table.Cell>
                        <span className="inline-flex rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium capitalize text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          {categoryTitle(post)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-sm text-muted">
                        {post.createdAt
                          ? getPostFormattedDate(post.createdAt)
                          : "Draft"}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <Clock className="size-3.5" />
                          {readMinutes} min
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Link href={`${basePath}/edit/${post.id}`}>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              aria-label={`Edit ${post.title}`}
                            >
                              <PencilSimple className="size-4" />
                            </Button>
                          </Link>
                          <Link href={`/posts/${post.id}`} target="_blank">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="ghost"
                              aria-label={`View ${post.title}`}
                            >
                              <Eye className="size-4" />
                            </Button>
                          </Link>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={`Delete ${post.title}`}
                            onPress={() => openDelete([post.id])}
                          >
                            <Trash className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      {selected.length > 0 ? (
        <div
          className={cn(
            "fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full border border-border bg-paper/95 px-4 py-2 shadow-lg backdrop-blur-sm",
            "md:inset-x-auto md:left-1/2 md:-translate-x-1/2"
          )}
        >
          <p className="text-sm font-medium">
            {selected.length} selected
          </p>
          <div className="flex gap-2">
            {selected.length === 1 ? (
              <Link href={`/posts/${selected[0]}`} target="_blank">
                <Button size="sm" variant="secondary" className="rounded-full">
                  <Eye className="mr-1 size-4" />
                  View
                </Button>
              </Link>
            ) : null}
            <Button
              size="sm"
              variant="danger"
              className="rounded-full"
              onPress={() => openDelete(selected)}
            >
              <Trash className="mr-1 size-4" />
              Delete
            </Button>
          </div>
        </div>
      ) : null}

      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Delete post(s)</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  Delete {deleteTarget.length} selected post(s)? This cannot be
                  undone.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  isDisabled={deleteMutation.isPending}
                  onPress={() => deleteMutation.mutate(deleteTarget)}
                >
                  Delete
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
