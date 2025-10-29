/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { getSupabaseServiceClient } from "@/lib/database";
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
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select()
      .eq("ref_id", refId)
      .eq("ref", ref)
      .order("created_at", { ascending: false });

    if (error) {
      setAlert(
        "Error",
        `Database query failed: ${error.message}`,
        () => {
          window.location.href = "/dashboard";
        },
        false,
      );
      return;
    }

    setActivityLogs(data || []);
    setFullLoading(false);
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
