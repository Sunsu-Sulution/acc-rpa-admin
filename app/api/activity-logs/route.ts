import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/server/db";

interface ActivityLogPayload {
  message?: string;
  ref?: string;
  refId?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");
  const refId = searchParams.get("refId");

  if (!ref || !refId) {
    return NextResponse.json(
      { message: "Missing ref or refId." },
      { status: 400 },
    );
  }

  try {
    const result = await query(
      `SELECT id, message, ref, ref_id, created_at
       FROM activity_logs
       WHERE ref = $1 AND ref_id = $2
       ORDER BY created_at DESC`,
      [ref, refId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[activity-logs][GET]", error);
    return NextResponse.json(
      { message: "Failed to load activity logs." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActivityLogPayload;
    const { message, ref, refId } = body;

    if (!message || !ref || !refId) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    await query(
      `INSERT INTO activity_logs (message, ref, ref_id)
       VALUES ($1, $2, $3)`,
      [message, ref, refId],
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[activity-logs][POST]", error);
    return NextResponse.json(
      { message: "Failed to create activity log." },
      { status: 500 },
    );
  }
}

