/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useHelperContext } from "@/components/providers/helper-provider";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import axios from "axios";

interface RpaJobResponse {
  activity_log_id: number;
  input_date: string;
  message: string;
  status: string;
  target_date: string;
}

export default function RetryJobPage() {
  const { header, setAlert, setFullLoading } = useHelperContext()();
  const [selectedDate, setSelectedDate] = useState("");
  const [response, setResponse] = useState<RpaJobResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    header.setTitle("Retry Job");
  }, []);

  const formatDateForInput = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const formatDateForAPI = (dateString: string): string => {
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const isDateValid = (dateString: string): boolean => {
    if (!dateString) return false;

    const selected = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);

    // Date must be in the past (not today or future)
    return selected < today;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (!selectedDate) {
      setError("กรุณาเลือกวันที่");
      return;
    }

    if (!isDateValid(selectedDate)) {
      setError("วันที่ต้องเป็นวันในอดีต (ไม่ใช่วันปัจจุบันหรืออนาคต)");
      return;
    }

    setFullLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const result = await axios.post("/api/rpa_job", {
        date: formattedDate,
      });

      setResponse(result.data);
      setAlert(
        "สำเร็จ",
        `RPA job started successfully. Activity Log ID: ${result.data.activity_log_id}`,
        undefined,
        false,
      );
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "เกิดข้อผิดพลาดในการยิง RPA job";
      setError(errorMessage);
      setAlert("เกิดข้อผิดพลาด", errorMessage, undefined, false);
    } finally {
      setFullLoading(false);
    }
  };

  const today = new Date();
  const maxDate = formatDateForInput(
    new Date(today.getTime() - 24 * 60 * 60 * 1000),
  ); // Yesterday

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Retry Job</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">เลือกวันที่ (ต้องเป็นวันในอดีต)</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setError(null);
                setResponse(null);
              }}
              max={maxDate}
              required
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
            <p className="text-sm text-muted-foreground">
              วันที่ที่เลือกต้องเป็นวันในอดีต (ไม่ใช่วันปัจจุบันหรืออนาคต)
            </p>
          </div>

          <Button type="submit" className="w-full">
            ยิง RPA Job
          </Button>
        </form>
      </Card>

      {response && (
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">ผลลัพธ์</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Activity Log ID:</span>{" "}
              {response.activity_log_id}
            </div>
            <div>
              <span className="font-medium">Input Date:</span>{" "}
              {response.input_date}
            </div>
            <div>
              <span className="font-medium">Target Date:</span>{" "}
              {response.target_date}
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span className="capitalize">{response.status}</span>
            </div>
            <div>
              <span className="font-medium">Message:</span> {response.message}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

