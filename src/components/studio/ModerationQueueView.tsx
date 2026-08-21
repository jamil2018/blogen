"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Spinner } from "@heroui/react";
import {
  listOpenReports,
  updateReportStatus,
} from "../../actions/reports";
import ErrorState from "../feedback/ErrorState";
import EmptyState from "../feedback/EmptyState";
import type { Tables } from "../../lib/supabase/database.types";

type ReportRow = Tables<"reports">;

export default function ModerationQueueView() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["moderation-reports"],
    queryFn: listOpenReports,
  });

  const reports = (data ?? []) as ReportRow[];

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "reviewed" | "dismissed" | "actioned";
    }) => updateReportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-reports"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) return <ErrorState message="Could not load reports" />;

  if (!reports.length) {
    return (
      <EmptyState
        title="No reports"
        description="User reports will appear here for moderation."
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
      <ul className="space-y-3">
        {reports.map((report) => (
          <li
            key={report.id}
            className="rounded-xl border border-border p-4 text-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium capitalize">
                  {report.target_type} · {report.status}
                </p>
                <p className="mt-1 text-muted">{report.reason}</p>
                {report.details ? (
                  <p className="mt-1 text-muted">{report.details}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted">
                  Target: {report.target_id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={mutation.isPending}
                  onPress={() =>
                    mutation.mutate({ id: report.id, status: "reviewed" })
                  }
                >
                  Reviewed
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  isDisabled={mutation.isPending}
                  onPress={() =>
                    mutation.mutate({ id: report.id, status: "dismissed" })
                  }
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  isDisabled={mutation.isPending}
                  onPress={() =>
                    mutation.mutate({ id: report.id, status: "actioned" })
                  }
                >
                  Actioned
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
