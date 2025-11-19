import { NextRequest, NextResponse } from "next/server";
import { convert } from 'baht';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ amout: string }> }
) {
    try {
        const params = await context.params;
        const amoutNumber = Number(params.amout);
        return NextResponse.json({
            "result": convert(amoutNumber)
        });
    } catch (error) {
        return NextResponse.json(
            { message: error },
            { status: 500 },
        );
    }
}
