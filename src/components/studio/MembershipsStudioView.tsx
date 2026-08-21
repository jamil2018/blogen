"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Button, Card, Input, Label, TextField, toast } from "@heroui/react";
import {
  createMembershipTier,
  getMembershipTiers,
  getMyReaderMemberships,
  getStripeStatus,
  openBillingPortal,
  startMembershipCheckout,
} from "../../actions/memberships";
import { useCurrentUser } from "../auth/AuthProvider";
import { readerMembershipLabel } from "../../lib/posts/stage-d-contracts";
import type { MembershipStatus } from "../../lib/posts/stage-d-contracts";

export default function MembershipsStudioView() {
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [stripeOk, setStripeOk] = useState(false);
  const [stripeMsg, setStripeMsg] = useState<string | null>(null);
  const [tiers, setTiers] = useState<
    Awaited<ReturnType<typeof getMembershipTiers>>
  >([]);
  const [memberships, setMemberships] = useState<
    Awaited<ReturnType<typeof getMyReaderMemberships>>
  >([]);
  const [name, setName] = useState("Supporters");
  const [amount, setAmount] = useState("500");
  const [interval, setInterval] = useState<"month" | "year">("month");

  const reload = () => {
    if (!user?.id) return;
    startTransition(async () => {
      const [status, t, m] = await Promise.all([
        getStripeStatus(),
        getMembershipTiers("author", user.id),
        getMyReaderMemberships().catch(() => []),
      ]);
      setStripeOk(status.configured);
      setStripeMsg(status.message);
      setTiers(t);
      setMemberships(m);
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const createPaid = () => {
    if (!user?.id) return;
    startTransition(async () => {
      try {
        await createMembershipTier({
          ownerType: "author",
          ownerId: user.id,
          name,
          isFree: false,
          interval,
          amountCents: Number(amount),
        });
        toast("Tier created", { variant: "success" });
        reload();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Failed", { variant: "danger" });
      }
    });
  };

  const createFree = () => {
    if (!user?.id) return;
    startTransition(async () => {
      try {
        await createMembershipTier({
          ownerType: "author",
          ownerId: user.id,
          name: "Free member",
          isFree: true,
        });
        toast("Free tier created", { variant: "success" });
        reload();
      } catch (e) {
        toast(e instanceof Error ? e.message : "Failed", { variant: "danger" });
      }
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-ink">
          Memberships
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Free and paid tiers map to Stripe Prices when provisioned. Checkout
          refuses without real Stripe env — no mocked payments.
        </p>
      </header>

      {!stripeOk && (
        <Alert status="warning">
          {stripeMsg ??
            "Stripe is not configured. See docs/qa/checkpoint-f.md for Marketplace steps."}
        </Alert>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your tiers</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tiers.map((t) => (
            <Card key={t.id} className="space-y-2 p-4">
              <p className="font-medium">{t.name}</p>
              <p className="text-sm text-muted">
                {t.isFree
                  ? "Free"
                  : `${((t.amountCents ?? 0) / 100).toFixed(2)} ${t.currency.toUpperCase()} / ${t.interval}`}
              </p>
              <p className="text-xs text-muted">
                Stripe Price: {t.stripePriceId ?? "not synced"}
              </p>
              {!t.isFree && (
                <Button
                  size="sm"
                  isDisabled={!stripeOk || !t.stripePriceId || pending}
                  onPress={() =>
                    startTransition(async () => {
                      try {
                        const { url } = await startMembershipCheckout({
                          tierId: t.id,
                        });
                        window.location.href = url;
                      } catch (e) {
                        toast(
                          e instanceof Error ? e.message : "Checkout blocked",
                          { variant: "danger" }
                        );
                      }
                    })
                  }
                >
                  Test checkout (as reader)
                </Button>
              )}
            </Card>
          ))}
          {tiers.length === 0 && (
            <p className="text-sm text-muted">No tiers yet.</p>
          )}
        </div>

        <Card className="space-y-3 p-4">
          <p className="text-sm font-medium">Create paid tier</p>
          <TextField>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </TextField>
          <TextField>
            <Label>Amount (cents)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
          </TextField>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={interval === "month" ? "primary" : "secondary"}
              onPress={() => setInterval("month")}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant={interval === "year" ? "primary" : "secondary"}
              onPress={() => setInterval("year")}
            >
              Annual
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button isDisabled={pending} onPress={createPaid}>
              Create paid tier
            </Button>
            <Button variant="secondary" isDisabled={pending} onPress={createFree}>
              Create free tier
            </Button>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Your subscriptions</h2>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={!stripeOk || pending}
            onPress={() =>
              startTransition(async () => {
                try {
                  const { url } = await openBillingPortal();
                  window.location.href = url;
                } catch (e) {
                  toast(
                    e instanceof Error ? e.message : "Portal blocked",
                    { variant: "danger" }
                  );
                }
              })
            }
          >
            Customer portal
          </Button>
        </div>
        {memberships.length === 0 ? (
          <p className="text-sm text-muted">No memberships yet.</p>
        ) : (
          <ul className="space-y-2">
            {memberships.map((m) => (
              <li key={m.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                Tier {m.tierId.slice(0, 8)}… —{" "}
                {readerMembershipLabel(m.status as MembershipStatus)}
                {m.cancelAtPeriodEnd ? " (cancels at period end)" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
