"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Spinner } from "@heroui/react";
import ErrorState from "../feedback/ErrorState";
import { getCuratedPostListByAuthor } from "../../data/postQueryFunctions";
import { POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { formatData } from "../../utils/dataFormat";

export default function UserDashboardView() {
  const router = useRouter();
  const { user, isRehydrated } = useSelector(
    (state: {
      userData: {
        user: { _id?: string; isAdmin?: boolean };
        isRehydrated: boolean;
      };
    }) => state.userData
  );

  const { isLoading, isError, isFetching, data } = useQuery({
    queryKey: [POST_DATA, "author-curated"],
    queryFn: getCuratedPostListByAuthor,
  });

  const chartData = useMemo(
    () => (data ? formatData(data, "createdAt") : []),
    [data]
  );

  useEffect(() => {
    if (!isRehydrated) return;
    if (user.isAdmin || !user._id) router.push("/");
  }, [isRehydrated, router, user]);

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (isError) return <ErrorState />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Card className="p-4">
        <h2 className="mb-4 text-center text-lg font-medium">
          Posts created over time
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="count"
              fill="oklch(0.508 0.118 175)"
              name="Posts"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
