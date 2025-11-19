import { NextRequest, NextResponse } from "next/server";
import { convert } from 'baht';

export async function GET(request: NextRequest, { params }: { params: { amout: string } }) {
    try {
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
