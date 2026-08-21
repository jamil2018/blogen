"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import Link from "next/link";
import {
  createMyPublication,
  getMyPublications,
  getStudioPublication,
  invitePublicationMember,
  reviewSubmission,
  savePublicationSection,
  updateMyPublication,
} from "../../actions/publications";
import {
  exportAudienceCsv,
  getAudienceDashboard,
  importAudienceCsv,
} from "../../actions/subscriptions";
import {
  createNewsletterFromPost,
  getPublicationNewsletters,
  getResendProvisionStatus,
  previewNewsletter,
  sendNewsletterNow,
} from "../../actions/newsletters";
import type { SubmissionStatus } from "../../types/publication";
import { canPerformEditorialAction } from "../../lib/posts/stage-c-contracts";

export default function PublicationsStudioView() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string>("");
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [memberUserId, setMemberUserId] = useState("");
  const [memberRole, setMemberRole] = useState<"editor" | "contributor">(
    "contributor"
  );
  const [sectionName, setSectionName] = useState("");
  const [sectionSlug, setSectionSlug] = useState("");
  const [csvText, setCsvText] = useState("");
  const [consent, setConsent] = useState("");
  const [audienceQ, setAudienceQ] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: pubs, isLoading } = useQuery({
    queryKey: ["my-publications"],
    queryFn: getMyPublications,
  });

  const activeId = selectedId || pubs?.[0]?.id || "";

  const { data: studio } = useQuery({
    queryKey: ["studio-publication", activeId],
    queryFn: () => getStudioPublication(activeId),
    enabled: Boolean(activeId),
  });

  const { data: audience } = useQuery({
    queryKey: ["audience", activeId, audienceQ],
    queryFn: () =>
      getAudienceDashboard({
        targetType: "publication",
        targetId: activeId,
        q: audienceQ || undefined,
      }),
    enabled: Boolean(activeId),
  });

  const { data: newsletters } = useQuery({
    queryKey: ["newsletters", activeId],
    queryFn: () => getPublicationNewsletters(activeId),
    enabled: Boolean(activeId),
  });

  const { data: resendStatus } = useQuery({
    queryKey: ["resend-status"],
    queryFn: getResendProvisionStatus,
  });

  const role = studio?.role;
  const canEdit = canPerformEditorialAction(role, "manage_branding");
  const canMembers = canPerformEditorialAction(role, "manage_members");
  const canAudience = canPerformEditorialAction(role, "manage_audience");
  const canNewsletter = canPerformEditorialAction(role, "send_newsletter");
  const canReview = canPerformEditorialAction(role, "accept");

  const brandForm = useMemo(
    () => ({
      name: studio?.publication.name ?? "",
      description: studio?.publication.description ?? "",
      tagline: studio?.publication.tagline ?? "",
      about: studio?.publication.about ?? "",
      welcomeEmailSubject: studio?.publication.welcomeEmailSubject ?? "",
      welcomeEmailBody: studio?.publication.welcomeEmailBody ?? "",
      welcomeEmailEnabled: studio?.publication.welcomeEmailEnabled ?? false,
    }),
    [studio]
  );

  const [brand, setBrand] = useState(brandForm);
  const [brandSource, setBrandSource] = useState(brandForm);
  if (brandForm !== brandSource) {
    setBrandSource(brandForm);
    setBrand(brandForm);
  }

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["my-publications"] });
    await queryClient.invalidateQueries({
      queryKey: ["studio-publication", activeId],
    });
    await queryClient.invalidateQueries({ queryKey: ["audience", activeId] });
    await queryClient.invalidateQueries({
      queryKey: ["newsletters", activeId],
    });
  };

  const onCreate = async () => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("name", createName);
      if (createSlug) fd.set("slug", createSlug);
      const pub = await createMyPublication(fd);
      setSelectedId(pub.id);
      setCreateName("");
      setCreateSlug("");
      toast("Publication created", { variant: "success" });
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Create failed", {
        variant: "danger",
      });
    } finally {
      setBusy(false);
    }
  };

  const onSaveBrand = async () => {
    if (!activeId) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("name", brand.name);
      fd.set("description", brand.description);
      fd.set("tagline", brand.tagline);
      fd.set("about", brand.about);
      fd.set("welcomeEmailSubject", brand.welcomeEmailSubject);
      fd.set("welcomeEmailBody", brand.welcomeEmailBody);
      fd.set("welcomeEmailEnabled", String(brand.welcomeEmailEnabled));
      await updateMyPublication(activeId, fd);
      toast("Saved", { variant: "success" });
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Save failed", {
        variant: "danger",
      });
    } finally {
      setBusy(false);
    }
  };

  const onReview = async (postId: string, toStatus: SubmissionStatus) => {
    if (!activeId) return;
    setBusy(true);
    try {
      await reviewSubmission(activeId, postId, toStatus);
      toast(`Marked ${toStatus}`, { variant: "success" });
      await refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Review failed", {
        variant: "danger",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Publications</h1>
        <p className="mt-1 text-sm text-muted">
          Create branded pubs, manage contributors, review submissions, and
          operate audience email (Resend).
        </p>
      </div>

      {!resendStatus?.configured ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Resend is not provisioned yet. Audience import/export and editorial
              workflow work; newsletter send and welcome email require{" "}
              <code>RESEND_API_KEY</code> and <code>RESEND_FROM_EMAIL</code>. See{" "}
              <code>docs/qa/checkpoint-e.md</code>.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Create</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField>
            <Label>Name</Label>
            <Input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
          />
          </TextField>
          <TextField>
            <Label>Slug (optional)</Label>
            <Input
            value={createSlug}
            onChange={(e) => setCreateSlug(e.target.value)}
          />
          </TextField>
          <Button
            onPress={() => void onCreate()}
            isDisabled={busy || !createName.trim()}
          >
            Create
          </Button>
        </div>
      </section>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !pubs?.length ? (
        <p className="text-sm text-muted">No publications yet.</p>
      ) : (
        <section className="space-y-2">
          <Label>Your publications</Label>
          <Select
            aria-label="Select publication"
            selectedKey={activeId}
            onSelectionChange={(key) => setSelectedId(String(key))}
          >
            <ListBox>
              {pubs.map((p) => (
                <ListBoxItem key={p.id} id={p.id} textValue={p.name}>
                  {p.name}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select>
          {studio ? (
            <p className="text-sm text-muted">
              Role: {studio.role} ·{" "}
              <Link
                href={`/pubs/${studio.publication.slug}`}
                className="underline"
              >
                View public page
              </Link>
            </p>
          ) : null}
        </section>
      )}

      {studio && canEdit ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Branding & welcome email</h2>
          <TextField>
            <Label>Name</Label>
            <Input
            value={brand.name}
            onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))}
          />
          </TextField>
          <TextField>
            <Label>Tagline</Label>
            <Input
            value={brand.tagline}
            onChange={(e) =>
              setBrand((b) => ({ ...b, tagline: e.target.value }))
            }
          />
          </TextField>
          <TextField>
            <Label>Description</Label>
            <TextArea
            value={brand.description}
            onChange={(e) =>
              setBrand((b) => ({ ...b, description: e.target.value }))
            }
          />
          </TextField>
          <TextField>
            <Label>About</Label>
            <TextArea
            value={brand.about}
            onChange={(e) => setBrand((b) => ({ ...b, about: e.target.value }))}
          />
          </TextField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={brand.welcomeEmailEnabled}
              onChange={(e) =>
                setBrand((b) => ({
                  ...b,
                  welcomeEmailEnabled: e.target.checked,
                }))
              }
            />
            Enable welcome email (requires Resend)
          </label>
          <TextField>
            <Label>Welcome subject</Label>
            <Input
            value={brand.welcomeEmailSubject}
            onChange={(e) =>
              setBrand((b) => ({
                ...b,
                welcomeEmailSubject: e.target.value,
              }))
            }
          />
          </TextField>
          <TextField>
            <Label>Welcome body (HTML)</Label>
            <TextArea
            value={brand.welcomeEmailBody}
            onChange={(e) =>
              setBrand((b) => ({ ...b, welcomeEmailBody: e.target.value }))
            }
          />
          </TextField>
          <Button onPress={() => void onSaveBrand()} isDisabled={busy}>
            Save settings
          </Button>
        </section>
      ) : null}

      {studio && canEdit ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Sections</h2>
          <ul className="space-y-1 text-sm">
            {studio.sections.map((s) => (
              <li key={s.id}>
                {s.name} <span className="text-muted">/{s.slug}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField>
              <Label>Section name</Label>
              <Input
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            </TextField>
            <TextField>
              <Label>Slug</Label>
              <Input
              value={sectionSlug}
              onChange={(e) => setSectionSlug(e.target.value)}
            />
            </TextField>
            <Button
              isDisabled={busy || !sectionName || !sectionSlug}
              onPress={async () => {
                const fd = new FormData();
                fd.set("name", sectionName);
                fd.set("slug", sectionSlug);
                try {
                  await savePublicationSection(activeId, fd);
                  setSectionName("");
                  setSectionSlug("");
                  toast("Section added", { variant: "success" });
                  await refresh();
                } catch (err) {
                  toast(err instanceof Error ? err.message : "Failed", {
                    variant: "danger",
                  });
                }
              }}
            >
              Add section
            </Button>
          </div>
        </section>
      ) : null}

      {studio && canMembers ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Members</h2>
          <ul className="space-y-1 text-sm">
            {studio.members.map((m) => (
              <li key={m.userId}>
                {m.userName || m.userEmail || m.userId} — {m.role}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <TextField>
              <Label>User id</Label>
              <Input
              value={memberUserId}
              onChange={(e) => setMemberUserId(e.target.value)}
            />
            </TextField>
            <Select
              aria-label="Role"
              selectedKey={memberRole}
              onSelectionChange={(key) =>
                setMemberRole(String(key) as "editor" | "contributor")
              }
            >
              <ListBox>
                <ListBoxItem id="editor" textValue="editor">
                  Editor
                </ListBoxItem>
                <ListBoxItem id="contributor" textValue="contributor">
                  Contributor
                </ListBoxItem>
              </ListBox>
            </Select>
            <Button
              isDisabled={busy || !memberUserId}
              onPress={async () => {
                try {
                  await invitePublicationMember(
                    activeId,
                    memberUserId,
                    memberRole
                  );
                  setMemberUserId("");
                  toast("Member added", { variant: "success" });
                  await refresh();
                } catch (err) {
                  toast(err instanceof Error ? err.message : "Failed", {
                    variant: "danger",
                  });
                }
              }}
            >
              Add member
            </Button>
          </div>
        </section>
      ) : null}

      {studio ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Submissions</h2>
          {!studio.submissions.length ? (
            <p className="text-sm text-muted">No submissions yet.</p>
          ) : (
            <ul className="space-y-4">
              {studio.submissions.map((post) => (
                <li
                  key={post.id}
                  className="border-b border-border/60 pb-3 text-sm"
                >
                  <div className="font-medium">{post.title}</div>
                  <div className="text-muted">
                    Status: {post.submissionStatus ?? "—"}
                  </div>
                  {canReview ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          "changes_requested",
                          "accepted",
                          "rejected",
                          "published",
                        ] as SubmissionStatus[]
                      ).map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant="secondary"
                          isDisabled={busy}
                          onPress={() => void onReview(post.id, status)}
                        >
                          {status.replace(/_/g, " ")}
                        </Button>
                      ))}
                      {canNewsletter ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={busy || !resendStatus?.configured}
                          onPress={async () => {
                            try {
                              const nl = await createNewsletterFromPost(
                                activeId,
                                post.id
                              );
                              await previewNewsletter(nl.id);
                              toast("Newsletter draft ready", {
                                variant: "success",
                              });
                              await refresh();
                            } catch (err) {
                              toast(
                                err instanceof Error ? err.message : "Failed",
                                { variant: "danger" }
                              );
                            }
                          }}
                        >
                          Draft newsletter
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {studio && canNewsletter ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Newsletters</h2>
          {!newsletters?.length ? (
            <p className="text-sm text-muted">No newsletters yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {newsletters.map((nl) => (
                <li key={nl.id} className="flex flex-wrap items-center gap-3">
                  <span>
                    {nl.subject} · {nl.status} · {nl.distributionMode}
                  </span>
                  <Button
                    size="sm"
                    isDisabled={busy || !resendStatus?.configured}
                    onPress={async () => {
                      try {
                        const result = await sendNewsletterNow(nl.id);
                        toast(
                          `Sent ${result.sent}, failed ${result.failed}`,
                          { variant: "success" }
                        );
                        await refresh();
                      } catch (err) {
                        toast(err instanceof Error ? err.message : "Send failed", {
                          variant: "danger",
                        });
                      }
                    }}
                  >
                    Send
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {studio && canAudience ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Audience</h2>
          <TextField>
            <Label>Search email</Label>
            <Input
            value={audienceQ}
            onChange={(e) => setAudienceQ(e.target.value)}
          />
          </TextField>
          <p className="text-sm text-muted">
            {audience?.count ?? 0} subscribers
          </p>
          <ul className="max-h-48 space-y-1 overflow-auto text-sm">
            {(audience?.data ?? []).map((s) => (
              <li key={s.id}>
                {s.email} · {s.status} · {s.source}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onPress={async () => {
                const result = await exportAudienceCsv({
                  targetType: "publication",
                  targetId: activeId,
                });
                const blob = new Blob([result.csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </Button>
          </div>
          <TextField>
            <Label>Import CSV (email column)</Label>
            <TextArea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          </TextField>
          <TextField>
            <Label>Consent attestation (required)</Label>
            <TextArea
            value={consent}
            onChange={(e) => setConsent(e.target.value)}
            placeholder="I attest these subscribers consented to email from this publication…"
          />
          </TextField>
          <Button
            isDisabled={busy || !csvText || !consent}
            onPress={async () => {
              const fd = new FormData();
              fd.set("targetType", "publication");
              fd.set("targetId", activeId);
              fd.set("csvText", csvText);
              fd.set("consentAttestation", consent);
              try {
                const result = await importAudienceCsv(fd);
                toast(
                  `Imported ${result.imported}, skipped ${result.skipped}, suppressed ${result.suppressed}`,
                  { variant: "success" }
                );
                await refresh();
              } catch (err) {
                toast(err instanceof Error ? err.message : "Import failed", {
                  variant: "danger",
                });
              }
            }}
          >
            Import with consent
          </Button>
        </section>
      ) : null}
    </div>
  );
}
