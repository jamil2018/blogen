"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, toast } from "@heroui/react";
import PageHero from "../layout/PageHero";
import { createUserCollection } from "../../actions/collections";

export default function NewCollectionPageView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    setPending(true);
    try {
      const collection = await createUserCollection(name);
      toast("Collection created", { variant: "success" });
      router.push(`/library/collections/${collection.id}`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not create collection", {
        variant: "danger",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Collection"
        title="Create a collection"
        description="Name a source set you can revisit, annotate, and later promote to a knowledge space."
      />
      <div className="mx-auto max-w-md space-y-3">
        <Input
          aria-label="Collection name"
          placeholder="e.g. Coding agent reliability"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onPress={handleCreate} isDisabled={!name.trim() || pending}>
          Create collection
        </Button>
      </div>
    </>
  );
}
