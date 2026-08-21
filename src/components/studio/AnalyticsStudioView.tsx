"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Card, Spinner } from "@heroui/react";
import { getCreatorAnalyticsDashboard } from "../../actions/analytics";

const ACCENT = "oklch(0.508 0.118 175)";

type Period = 7 | 30 | 90;

export default function AnalyticsStudioView() {
  const [period, setPeriod] = useState<Period>(30);
  const [pending, startTransition] = useTransition();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getCreatorAnalyticsDashboard>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await getCreatorAnalyticsDashboard({ days: period });
        setData(result);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load analytics");
      }
    });
  }, [period]);

  const chartData = useMemo(
    () =>
      (data?.rows ?? []).map((r) => ({
        day: r.day.slice(5),
        views: r.views,
        reads: r.readCompletes,
        follows: r.follows,
        subs: r.subscribes,
      })),
    [data]
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl tracking-tight text-ink">
          Analytics
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          First-party metrics with privacy-minimized event payloads. Definitions
          live in{" "}
          <code className="text-xs">docs/analytics/metrics.md</code>.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {([7, 30, 90] as Period[]).map((d) => (
          <Button
            key={d}
            size="sm"
            variant={period === d ? "primary" : "secondary"}
            onPress={() => setPeriod(d)}
          >
            {d}d
          </Button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : pending && !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Views", data?.summary.views ?? 0],
              ["Read completes", data?.summary.readCompletes ?? 0],
              ["Follows", data?.summary.follows ?? 0],
              ["Subscribes", data?.summary.subscribes ?? 0],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {value}
                </p>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <p className="mb-4 text-sm font-medium text-ink">Traffic</p>
            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">
                  No events in this window yet. Views, follows, and subscribes
                  will appear after reader activity.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke={ACCENT}
                      fill={ACCENT}
                      fillOpacity={0.15}
                    />
                    <Area
                      type="monotone"
                      dataKey="reads"
                      stroke="oklch(0.55 0.08 250)"
                      fill="oklch(0.55 0.08 250)"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
