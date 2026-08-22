"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Button, Card, Skeleton, toast } from "@heroui/react";
import { AsyncSection } from "../feedback/AsyncSection";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { KPICardSkeletonRow } from "../feedback/StudioSkeleton";
import {
  getEarningsDashboard,
  startConnectOnboarding,
} from "../../actions/earnings";
import { useCurrentUser } from "../auth/AuthProvider";

function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function EarningsStudioView() {
  const user = useCurrentUser();
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getEarningsDashboard>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    if (!user?.id) return;
    startTransition(async () => {
      try {
        const result = await getEarningsDashboard({
          ownerType: "author",
          ownerId: user.id,
        });
        setData(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load earnings");
      }
    });
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isInitialLoading = !data && pending;
  const summary = data?.summary;
  const currency = summary?.currency ?? "usd";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-ink">
          Earnings
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Gross, fees, refunds, and net from the ledger. Blogen never stores
          card or bank PAN — payouts run through Stripe Connect Express.
        </p>
      </header>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {!error ? (
        <>
          {data && !data.stripeConfigured ? (
            <Alert status="warning">
              Stripe is not configured. Connect onboarding and live payouts are
              blocked until Marketplace provisioning completes (see
              docs/qa/checkpoint-f.md).
            </Alert>
          ) : null}

          <AsyncSection
            isLoading={isInitialLoading}
            skeleton={
              <KPICardSkeletonRow
                count={5}
                className="sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5"
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Gross", summary?.gross ?? 0],
                ["Fees", summary?.fees ?? 0],
                ["Refunds", summary?.refunds ?? 0],
                ["Net", summary?.net ?? 0],
                ["Payouts", summary?.payouts ?? 0],
              ].map(([label, cents]) => (
                <Card key={String(label)} className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tabular-nums">
                    {formatMoney(Number(cents), currency)}
                  </p>
                </Card>
              ))}
            </div>
          </AsyncSection>

          <AsyncSection
            isLoading={isInitialLoading}
            skeleton={
              <Card className="space-y-3 p-4">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-4 w-full max-w-md rounded-md" />
                <Skeleton className="h-10 w-48 rounded-full" />
              </Card>
            }
          >
            <Card className="space-y-3 p-4">
                <p className="text-sm font-medium">Stripe Connect</p>
                <p className="text-sm text-muted">
                  Status: {data?.connect?.onboardingStatus ?? "not_started"}
                  {data?.connect?.payoutsEnabled ? " · payouts enabled" : ""}
                </p>
                <Button
                  isDisabled={!data?.stripeConfigured || pending}
                  onPress={() =>
                    startTransition(async () => {
                      if (!user?.id) return;
                      try {
                        const { url } = await startConnectOnboarding({
                          ownerType: "author",
                          ownerId: user.id,
                        });
                        window.location.href = url;
                      } catch (e) {
                        toast(
                          e instanceof Error ? e.message : "Connect blocked",
                          { variant: "danger" }
                        );
                      }
                    })
                  }
                >
                  {data?.connect?.stripeAccountId
                    ? "Continue Connect onboarding"
                    : "Start Connect Express"}
                </Button>
            </Card>
          </AsyncSection>

          <section className="space-y-3">
            <h2 className="text-lg font-medium">Ledger</h2>
            <AsyncSection
              isLoading={isInitialLoading}
              skeleton={<ExpandedPostSkeletonList count={5} />}
            >
              {(data?.entries.length ?? 0) === 0 ? (
                <p className="text-sm text-muted">
                  No ledger entries yet. Paid invoices populate this after
                  Stripe webhooks fire.
                </p>
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {data!.entries.map((e) => (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <span>
                        {e.kind} — {e.description || "—"}
                      </span>
                      <span className="tabular-nums">
                        {formatMoney(e.amountCents, e.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </AsyncSection>
          </section>
        </>
      ) : null}
    </div>
  );
}
