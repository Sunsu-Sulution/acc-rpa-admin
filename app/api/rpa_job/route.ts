import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleError } from "@/lib/backend-helper";

interface RpaJobPayload {
  date: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RpaJobPayload;
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { message: "Missing required field: date" },
        { status: 400 },
      );
    }

    // Validate date format (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: "Invalid date format. Expected DD/MM/YYYY" },
        { status: 400 },
      );
    }

    // Call external backend API
    const response = await axios.post(
      "http://43.209.223.73:5000/api/rpa_job",
      { date },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: unknown) {
    console.error("[rpa_job][POST]", error);
    return handleError(error);
  }
}

