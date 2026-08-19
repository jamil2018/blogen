"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilSimple, Trash } from "@phosphor-icons/react";
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
  getAllUsers,
  deleteMultipleUsersById,
} from "../../data/userQueryFunctions";
import type { User } from "../../types";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { selectionToIds } from "../../lib/selection";

export default function AdminUsersView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getAllUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMultipleUsersById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_DATA] });
      setSelected([]);
      setDeleteOpen(false);
      toast("User(s) deleted", { variant: "success" });
    },
  });

  const rows = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (u: User) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
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
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            isDisabled={selected.length !== 1}
            onPress={() => router.push(`/admin/users/edit/${selected[0]}`)}
          >
            <PencilSimple className="mr-1 size-4" />
            Edit
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
        placeholder="Search users…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Users"
            selectionMode="multiple"
            selectedKeys={new Set(selected)}
            onSelectionChange={(keys) =>
              setSelected(selectionToIds(keys, rows.map((u: User) => u.id)))
            }
          >
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Email</Table.Column>
              <Table.Column>Admin</Table.Column>
            </Table.Header>
            <Table.Body items={rows}>
              {(u: User) => (
                <Table.Row id={u.id}>
                  <Table.Cell>{u.name}</Table.Cell>
                  <Table.Cell>{u.email}</Table.Cell>
                  <Table.Cell>{u.isAdmin ? "Yes" : "No"}</Table.Cell>
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
                <Modal.Heading>Delete user(s)</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  Delete {selected.length} selected user(s)?
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
