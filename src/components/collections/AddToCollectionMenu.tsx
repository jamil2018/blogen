"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderPlus, Plus } from "@phosphor-icons/react";
import {
  Button,
  Input,
  Modal,
  toast,
} from "@heroui/react";
import { useCurrentUser } from "../auth/AuthProvider";
import {
  addToCollection,
  createUserCollection,
  getCollectionsWithMembership,
  removeFromCollection,
} from "../../actions/collections";

type AddToCollectionMenuProps = {
  postId: string;
  variant?: "icon" | "button";
  className?: string;
};

export default function AddToCollectionMenu({
  postId,
  variant = "icon",
  className,
}: AddToCollectionMenuProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections-membership", postId, user?.id],
    queryFn: () => getCollectionsWithMembership(postId),
    enabled: Boolean(user?.id && open),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({
      collectionId,
      contains,
    }: {
      collectionId: string;
      contains: boolean;
    }) => {
      if (contains) {
        await removeFromCollection(collectionId, postId);
        return false;
      }
      await addToCollection(collectionId, postId);
      return true;
    },
    onSuccess: (added) => {
      queryClient.invalidateQueries({
        queryKey: ["collections-membership", postId, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-collections"] });
      toast(
        added
          ? "Added to collection"
          : "Removed from collection",
        { variant: "success" }
      );
    },
    onError: (error) => {
      toast(
        error instanceof Error
          ? error.message
          : "Could not update collection",
        { variant: "danger" }
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const collection = await createUserCollection(name);
      await addToCollection(collection.id, postId);
      return collection;
    },
    onSuccess: () => {
      setNewName("");
      setCreating(false);
      queryClient.invalidateQueries({
        queryKey: ["collections-membership", postId, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-collections"] });
      toast("Collection created and source added", { variant: "success" });
    },
    onError: (error) => {
      toast(
        error instanceof Error ? error.message : "Could not create collection",
        { variant: "danger" }
      );
    },
  });

  const handleOpen = () => {
    if (!user?.id) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setOpen(true);
  };

  const trigger =
    variant === "button" ? (
      <Button variant="ghost" size="sm" className={className} onPress={handleOpen}>
        <FolderPlus className="size-4" />
        Add to collection
      </Button>
    ) : (
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Add to collection"
        className={className}
        onPress={handleOpen}
      >
        <FolderPlus className="size-4" />
      </Button>
    );

  return (
    <>
      {trigger}
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container>
          <Modal.Dialog className="max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add to collection</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-sm text-muted">
                Organize sources around a purpose. The saved revision is pinned
                automatically.
              </p>
              {isLoading ? (
                <p className="text-sm text-muted">Loading collections…</p>
              ) : collections.length ? (
                <ul className="space-y-1">
                  {collections.map((collection) => (
                    <li key={collection.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        disabled={toggleMutation.isPending}
                        onClick={() =>
                          toggleMutation.mutate({
                            collectionId: collection.id,
                            contains: collection.containsPost,
                          })
                        }
                      >
                        <span>{collection.name}</span>
                        <span className="text-xs text-muted">
                          {collection.containsPost ? "Added" : "Add"}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No collections yet.</p>
              )}

              {creating ? (
                <div className="flex gap-2">
                  <Input
                    aria-label="Collection name"
                    placeholder="e.g. Agent reliability"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onPress={() => createMutation.mutate(newName)}
                    isDisabled={!newName.trim() || createMutation.isPending}
                  >
                    Create
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setCreating(true)}
                >
                  <Plus className="size-4" />
                  New collection
                </Button>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
