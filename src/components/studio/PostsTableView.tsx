"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, PencilSimple, Trash } from "@phosphor-icons/react";
import {
  Button,
  Input,
  Modal,
  Spinner,
  Table,
  Toast,
  toast,
} from "@heroui/react";
import ErrorState from "../feedback/ErrorState";
import {
  getAllPosts,
  getMyPosts,
  deleteMultiplePostsById,
} from "../../data/postQueryFunctions";
import { POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Post } from "../../types";
import { selectionToIds } from "../../lib/selection";

type PostsTableViewProps = {
  basePath: string;
  requireAdmin?: boolean;
  filterByAuthor?: boolean;
};

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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [POST_DATA, { filterByAuthor }],
    queryFn: filterByAuthor ? getMyPosts : getAllPosts,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMultiplePostsById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POST_DATA] });
      setSelected([]);
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
    return posts;
  }, [data, search]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) return <ErrorState />;

  return (
    <div className="space-y-4">
      <Toast.Provider placement="bottom end" />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <div className="flex gap-2">
          <Link href={`${basePath}/create`}>
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              Create
            </Button>
          </Link>
          <Link href={`${basePath}/edit/${selected[0]}`}>
            <Button
              size="sm"
              variant="secondary"
              isDisabled={selected.length !== 1}
            >
              <PencilSimple className="mr-1 size-4" />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            isDisabled={selected.length === 0}
            onPress={() => setDeleteOpen(true)}
          >
            <Trash className="mr-1 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search posts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

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
              <Table.Column isRowHeader>Title</Table.Column>
              <Table.Column>Author</Table.Column>
              <Table.Column>Category</Table.Column>
              <Table.Column>Tags</Table.Column>
            </Table.Header>
            <Table.Body items={rows}>
              {(post: Post) => (
                <Table.Row id={post.id}>
                  <Table.Cell>{post.title}</Table.Cell>
                  <Table.Cell>
                    {typeof post.author === "object" ? post.author.name : "—"}
                  </Table.Cell>
                  <Table.Cell>
                    {typeof post.category === "object"
                      ? post.category.title
                      : "—"}
                  </Table.Cell>
                  <Table.Cell>{post.tags?.join(", ")}</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Delete post(s)</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  Delete {selected.length} selected post(s)?
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  isDisabled={deleteMutation.isPending}
                  onPress={() => deleteMutation.mutate(selected)}
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
