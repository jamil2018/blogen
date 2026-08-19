"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MagnifyingGlass,
  PencilSimple,
  ShieldCheck,
  Trash,
  User,
} from "@phosphor-icons/react";
import {
  Avatar,
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
import { getAllPosts } from "../../data/postQueryFunctions";
import type { Post, User as UserType } from "../../types";
import { USER_DATA, POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { selectionToIds } from "../../lib/selection";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { cn } from "../../lib/cn";

type RoleFilter = "all" | "admin" | "author";

export default function AdminUsersView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getAllUsers,
  });

  const { data: posts } = useQuery({
    queryKey: [POST_DATA, "admin-user-counts"],
    queryFn: getAllPosts,
  });

  const postCountByAuthor = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of (posts ?? []) as Post[]) {
      const authorId =
        typeof post.author === "object" ? post.author.id : String(post.author);
      if (!authorId) continue;
      counts.set(authorId, (counts.get(authorId) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

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
    let users = data as UserType[];

    if (search.trim()) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    if (roleFilter === "admin") {
      users = users.filter((u) => u.isAdmin);
    } else if (roleFilter === "author") {
      users = users.filter((u) => !u.isAdmin);
    }

    return users;
  }, [data, search, roleFilter]);

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
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted">
            Manage authors, admins, and publishing access.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full"
            isDisabled={selected.length !== 1}
            onPress={() => router.push(`/admin/users/edit/${selected[0]}`)}
          >
            <PencilSimple className="mr-1 size-4" />
            Edit
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-full border border-border p-0.5">
          {(["all", "admin", "author"] as RoleFilter[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                roleFilter === role
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-ink"
              )}
            >
              {role === "all" ? "All roles" : role}
            </button>
          ))}
        </div>
      </div>

      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Users"
            selectionMode="multiple"
            selectedKeys={new Set(selected)}
            onSelectionChange={(keys) =>
              setSelected(selectionToIds(keys, rows.map((u: UserType) => u.id)))
            }
          >
            <Table.Header>
              <Table.Column isRowHeader>User</Table.Column>
              <Table.Column>Email</Table.Column>
              <Table.Column>Role</Table.Column>
              <Table.Column>Posts</Table.Column>
            </Table.Header>
            <Table.Body items={rows}>
              {(u: UserType) => {
                const initials = getAuthorNameInitials(u.name)
                  .filter(Boolean)
                  .join("");
                const postCount = postCountByAuthor.get(u.id) ?? 0;

                return (
                  <Table.Row id={u.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          {u.imageURL ? (
                            <Avatar.Image src={u.imageURL} alt={u.name} />
                          ) : (
                            <Avatar.Fallback>{initials}</Avatar.Fallback>
                          )}
                        </Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-sm text-muted">{u.email}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          u.isAdmin
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        )}
                      >
                        {u.isAdmin ? (
                          <ShieldCheck className="size-3" weight="fill" />
                        ) : (
                          <User className="size-3" />
                        )}
                        {u.isAdmin ? "Admin" : "Author"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm tabular-nums text-muted">
                        {postCount}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                );
              }}
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
