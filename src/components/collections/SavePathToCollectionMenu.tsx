"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookmarkSimple, Plus } from "@phosphor-icons/react";
import { Button, Input, Modal, toast } from "@heroui/react";
import { useCurrentUser } from "../auth/AuthProvider";
import { createUserCollection, getUserCollections } from "../../actions/collections";
import { saveReadingPathToCollection } from "../../actions/phase2";

type SavePathToCollectionMenuProps = {
  pathSlug: string;
  className?: string;
};

export default function SavePathToCollectionMenu({
  pathSlug,
  className,
}: SavePathToCollectionMenuProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["user-collections", user?.id],
    queryFn: () => getUserCollections(),
    enabled: Boolean(user?.id && open),
  });

  const saveMutation = useMutation({
    mutationFn: (collectionId: string) =>
      saveReadingPathToCollection(pathSlug, collectionId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["user-collections"] });
      toast(`Saved ${result.added} sources to collection`, { variant: "success" });
      setOpen(false);
    },
    onError: (error) => {
      toast(
        error instanceof Error ? error.message : "Could not save path",
        { variant: "danger" }
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const collection = await createUserCollection(name);
      await saveReadingPathToCollection(pathSlug, collection.id);
      return collection;
    },
    onSuccess: () => {
      setNewName("");
      setCreating(false);
      queryClient.invalidateQueries({ queryKey: ["user-collections"] });
      toast("Collection created and path saved", { variant: "success" });
      setOpen(false);
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

  return (
    <>
      <Button variant="ghost" size="sm" className={className} onPress={handleOpen}>
        <BookmarkSimple className="size-4" />
        Save path to collection
      </Button>
      <Modal.Backdrop isOpen={open} onOpenChange={setOpen}>
        <Modal.Container>
          <Modal.Dialog className="max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Save reading path</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-3">
              <p className="text-sm text-muted">
                Add every post in this path to a collection. Each source pins its
                current revision.
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
                        disabled={saveMutation.isPending}
                        onClick={() => saveMutation.mutate(collection.id)}
                      >
                        <span>{collection.name}</span>
                        <span className="text-xs text-muted">Save here</span>
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
                    placeholder="e.g. Slow reading stack"
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
                <Button variant="ghost" size="sm" onPress={() => setCreating(true)}>
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
