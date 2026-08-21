"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "../lib/db/auth";
import {
  getConnectAccount,
  getEarningsSummary,
  listLedgerEntries,
  listPaymentSupportCases,
  upsertConnectAccount,
  createPaymentSupportCase,
} from "../lib/db/ledger";
import { getMyPublicationRole } from "../lib/db/publications";
import {
  isStripeConfigured,
  stripeCreateConnectAccountLink,
  stripeCreateExpressAccount,
} from "../lib/payments/stripe";
import { stripeCheckoutBlockedReason } from "../lib/posts/stage-d-contracts";
import { logAppEvent } from "../lib/observability";

async function assertOwnerAccess(
  ownerType: "author" | "publication",
  ownerId: string,
  userId: string
) {
  if (ownerType === "author" && ownerId !== userId) {
    throw new Error("Not allowed");
  }
  if (ownerType === "publication") {
    const role = await getMyPublicationRole(ownerId, userId);
    if (role !== "owner" && role !== "editor") {
      throw new Error("Not allowed");
    }
  }
}

export async function getEarningsDashboard(input: {
  ownerType: "author" | "publication";
  ownerId: string;
}) {
  const { user } = await requireUser();
  await assertOwnerAccess(input.ownerType, input.ownerId, user.id);
  const [summary, entries, connect] = await Promise.all([
    getEarningsSummary(input),
    listLedgerEntries({ ...input, limit: 50 }),
    getConnectAccount(input.ownerType, input.ownerId),
  ]);
  return {
    summary,
    entries,
    connect,
    stripeConfigured: isStripeConfigured(),
  };
}

export async function startConnectOnboarding(input: {
  ownerType: "author" | "publication";
  ownerId: string;
}) {
  if (!isStripeConfigured()) {
    throw new Error(stripeCheckoutBlockedReason(false)!);
  }

  const { user } = await requireUser();
  if (input.ownerType === "publication") {
    const role = await getMyPublicationRole(input.ownerId, user.id);
    if (role !== "owner") throw new Error("Only owners can connect payouts");
  } else if (input.ownerId !== user.id) {
    throw new Error("Not allowed");
  }

  let account = await getConnectAccount(input.ownerType, input.ownerId);
  if (!account?.stripeAccountId) {
    const created = await stripeCreateExpressAccount({
      email: user.email,
      metadata: {
        owner_type: input.ownerType,
        owner_id: input.ownerId,
      },
    });
    await upsertConnectAccount({
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      stripeAccountId: created.id,
      onboardingStatus: "pending",
    });
    account = {
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      stripeAccountId: created.id,
      onboardingStatus: "pending",
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const link = await stripeCreateConnectAccountLink({
    accountId: account.stripeAccountId!,
    refreshUrl: `${origin}/user/earnings?connect=refresh`,
    returnUrl: `${origin}/user/earnings?connect=return`,
  });

  revalidatePath("/user/earnings");
  return { url: link.url };
}

export async function getAdminPaymentCases() {
  await requireAdmin();
  return listPaymentSupportCases(100);
}

export async function openPaymentSupportCase(input: {
  membershipId?: string;
  notes: string;
  ownerType?: "author" | "publication";
  ownerId?: string;
}) {
  const { user } = await requireUser();
  try {
    const c = await createPaymentSupportCase({
      membershipId: input.membershipId,
      notes: input.notes,
      reporterUserId: user.id,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      status: "open",
    });
    revalidatePath("/admin/payments");
    return c;
  } catch (error) {
    logAppEvent("error", "payments.support_case_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}
