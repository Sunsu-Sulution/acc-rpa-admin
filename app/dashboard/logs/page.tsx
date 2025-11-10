import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { query } from "@/lib/server/db";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";

type ActivityLog = {
  id: number;
  message: string;
  ref: string;
  ref_id: string;
  created_at: string;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
};

const deriveStatus = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("done")) return "success";
  if (normalized.includes("failed")) return "error";
  return "pending";
};

const statusConfig = {
  success: {
    icon: CheckCircle2,
    label: "สำเร็จ",
    className: "text-emerald-600",
    chipClassName:
      "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  error: {
    icon: XCircle,
    label: "ไม่สำเร็จ",
    className: "text-rose-600",
    chipClassName:
      "bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30",
  },
  pending: {
    icon: Clock,
    label: "กำลังประมวลผล",
    className: "text-amber-600",
    chipClassName:
      "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  },
} as const;

export default async function Page() {
  const { rows } = await query<ActivityLog>(
    `SELECT id, message, ref, ref_id, created_at
     FROM activity_logs
     WHERE ref = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    ["job"],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-8">
      <Card>
        <CardHeader className="border-b border-border/60 pb-6">
          <CardTitle className="text-2xl">
            Process Daily Delivery Logs
          </CardTitle>
          <CardDescription>
            สรุปสถานะการทำงานของ Process Daily Delivery ล่าสุด
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="px-6 py-4">
            <div className="rounded-2xl border border-border/50 bg-background">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-36">สถานะ</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead className="w-64">Ref ID</TableHead>
                    <TableHead className="w-64">บันทึกเวลา</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
                          <Clock className="h-8 w-8" />
                          <p>
                            ยังไม่มีข้อมูลการทำงานสำหรับ Process Daily Delivery
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((log) => {
                      const statusKey = deriveStatus(log.message);
                      const status = statusConfig[statusKey];
                      const StatusIcon = status.icon;
                      const isLink =
                        statusKey === "success" &&
                        log.ref_id.startsWith("http");

                      return (
                        <TableRow key={log.id} className="border-border/40">
                          <TableCell>
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${status.chipClassName}`}
                            >
                              <StatusIcon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.message}
                          </TableCell>
                          <TableCell>
                            {isLink ? (
                              <Link
                                href={log.ref_id}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary underline decoration-2 underline-offset-4 transition hover:text-primary/80"
                              >
                                เปิดไฟล์รายงาน
                              </Link>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {log.ref_id}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(log.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
