/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { fetchActivityLogs } from "@/lib/database";
import { useEffect, useState } from "react";
import { useHelperContext } from "./providers/helper-provider";

interface ActivityLogProps {
  ref: string;
  refId: string;
}

interface ActivityLogData {
  id: number;
  message: string;
  ref: string;
  ref_id: string;
  created_at: string;
}

export default function ActivityLog({ ref, refId }: ActivityLogProps) {
  const { setAlert, setFullLoading } = useHelperContext()();
  const [activityLogs, setActivityLogs] = useState<ActivityLogData[]>([]);

  const fetchActivityLog = async () => {
    setFullLoading(true);
    try {
      const data = await fetchActivityLogs(ref, refId);
      setActivityLogs(data || []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      setAlert(
        "Error",
        `Database query failed: ${message}`,
        () => {
          window.location.href = "/dashboard";
        },
        false,
      );
    } finally {
      setFullLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLog();
  }, []);

  return (
    <div className="mt-4 bg-white p-5 shadow-md rounded-3xl">
      <div className="text-xl font-bold mb-4">Activity Log</div>
      <div className="w-full h-64 p-3 border border-gray-300 rounded-lg overflow-auto font-mono text-sm bg-gray-50">
        {activityLogs.length === 0 ? (
          <div className="text-gray-500">No activity logs found</div>
        ) : (
          activityLogs.map((log) => {
            const date = new Date(log.created_at).toLocaleString();
            const formattedMessage = log.message
              .replaceAll(/^- /gm, "•  ")
              .replaceAll("\n", "<br/>");
            return (
              <div key={log.id} className="mb-2">
                <b>[{date}]</b>{" "}
                <span dangerouslySetInnerHTML={{ __html: formattedMessage }} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
