"use client";

import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { Plus, Trash } from "@phosphor-icons/react";
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
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Category } from "../../types";
import { selectionToIds } from "../../lib/selection";

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
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="flex gap-2">
          <Button size="sm" onPress={() => setCreateOpen(true)}>
            <Plus className="mr-1 size-4" />
            Create
          </Button>
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
        placeholder="Search categories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
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
              <Table.Column isRowHeader>Title</Table.Column>
            </Table.Header>
            <Table.Body items={rows}>
              {(cat: Category) => (
                <Table.Row id={cat.id}>
                  <Table.Cell>{cat.title}</Table.Cell>
                </Table.Row>
              )}
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
                    />
                  </TextField>
                  <Button type="submit" className="mt-4">
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
