"use client";

import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MagnifyingGlass, Plus, Trash } from "@phosphor-icons/react";
import * as yup from "yup";
import {
  Button,
  Input,
  Label,
  Modal,
  Spinner,
  Table,
  TextField,
  Toast,
  toast,
} from "@heroui/react";
import ErrorState from "../feedback/ErrorState";
import {
  getAllCategories,
  createCategory,
  deleteMultipleCategoriesById,
} from "../../data/categoryQueryFunctions";
import { getAllPosts } from "../../data/postQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import type { Category, Post } from "../../types";
import { selectionToIds } from "../../lib/selection";

function categoryHue(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export default function AdminCategoriesView() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
  });

  const { data: posts } = useQuery({
    queryKey: [POST_DATA, "admin-category-counts"],
    queryFn: getAllPosts,
  });

  const postCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of (posts ?? []) as Post[]) {
      const title =
        typeof post.category === "object"
          ? post.category.title
          : String(post.category ?? "");
      if (!title) continue;
      counts.set(title, (counts.get(title) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_DATA] });
      setCreateOpen(false);
      formik.resetForm();
      toast("Category created", { variant: "success" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMultipleCategoriesById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORY_DATA] });
      setSelected([]);
      setDeleteOpen(false);
      toast("Category deleted", { variant: "success" });
    },
  });

  const formik = useFormik({
    initialValues: { title: "" },
    validationSchema: yup.object({ title: yup.string().required() }),
    onSubmit: (values) => createMutation.mutate(values),
  });

  const rows = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    return data.filter((c: Category) =>
      c.title.toLowerCase().includes(search.toLowerCase())
    );
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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted">
            Organize topics and monitor archive volume.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="rounded-full" onPress={() => setCreateOpen(true)}>
            <Plus className="mr-1 size-4" />
            Create
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="rounded-full"
            isDisabled={selected.length === 0}
            onPress={() => setDeleteOpen(true)}
          >
            <Trash className="mr-1 size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Categories"
            selectionMode="multiple"
            selectedKeys={new Set(selected)}
            onSelectionChange={(keys) =>
              setSelected(selectionToIds(keys, rows.map((c: Category) => c.id)))
            }
          >
            <Table.Header>
              <Table.Column isRowHeader>Category</Table.Column>
              <Table.Column>Posts</Table.Column>
              <Table.Column>Created</Table.Column>
            </Table.Header>
            <Table.Body items={rows}>
              {(cat: Category) => {
                const count = postCountByCategory.get(cat.title) ?? 0;
                const hue = categoryHue(cat.title);
                return (
                  <Table.Row id={cat.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: `oklch(0.62 0.14 ${hue})`,
                          }}
                          aria-hidden
                        />
                        <span className="font-medium capitalize">{cat.title}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium tabular-nums text-ink dark:bg-zinc-800">
                        {count} {count === 1 ? "post" : "posts"}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-sm text-muted">
                      {cat.createdAt
                        ? new Date(cat.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <Modal isOpen={createOpen} onOpenChange={setCreateOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Create category</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={formik.handleSubmit}>
                  <TextField name="title">
                    <Label>Title</Label>
                    <Input
                      name="title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      placeholder="e.g. engineering"
                    />
                  </TextField>
                  <Button type="submit" className="mt-4 rounded-full">
                    Create
                  </Button>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Delete categories</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  Delete {selected.length} selected categor(ies)?
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="ghost" onPress={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
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
