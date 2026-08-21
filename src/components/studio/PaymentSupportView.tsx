"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Card } from "@heroui/react";
import {
  getAdminPaymentCases,
  openPaymentSupportCase,
} from "../../actions/earnings";

export default function PaymentSupportView() {
  const [pending, startTransition] = useTransition();
  const [cases, setCases] = useState<
    Awaited<ReturnType<typeof getAdminPaymentCases>>
  >([]);
  const [notes, setNotes] = useState("");

  const reload = () => {
    startTransition(async () => {
      setCases(await getAdminPaymentCases());
    });
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-tight">Payment support</h1>
        <p className="mt-1 text-sm text-muted">
          Dispute and refund paths for admins. No PAN is stored in Blogen.
        </p>
      </header>

      <Card className="space-y-3 p-4">
        <label className="block text-sm">
          Open support case notes
          <textarea
            className="mt-1 w-full rounded-md border border-border bg-paper p-2 text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        <Button
          isDisabled={!notes.trim() || pending}
          onPress={() =>
            startTransition(async () => {
              await openPaymentSupportCase({ notes });
              setNotes("");
              reload();
            })
          }
        >
          Create case
        </Button>
      </Card>

      <ul className="space-y-2">
        {cases.map((c) => (
          <li
            key={c.id}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="font-medium">{c.status}</span>
            {c.stripeDisputeId ? ` · dispute ${c.stripeDisputeId}` : ""}
            <p className="mt-1 text-muted">{c.notes}</p>
          </li>
        ))}
        {cases.length === 0 && (
          <li className="text-sm text-muted">No payment support cases.</li>
        )}
      </ul>
    </div>
  );
}
