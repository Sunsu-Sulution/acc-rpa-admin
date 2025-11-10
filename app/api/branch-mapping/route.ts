import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/server/db";
import { BranchMapping } from "@/types/database";

const SELECT_COLUMNS =
  'SELECT "index", grab, line_edc, lineman, pre_shop, robinhood, shopeefood, shop, shop_br FROM bh_branch_map';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shopBr = searchParams.get("shop_br");
  try {
    const result = shopBr
      ? await query<BranchMapping>(
          `${SELECT_COLUMNS} WHERE shop_br = $1 ORDER BY "index" ASC`,
          [shopBr],
        )
      : await query<BranchMapping>(`${SELECT_COLUMNS} ORDER BY shop_br ASC, "index" ASC`);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[branch-mapping][GET]", error);
    return NextResponse.json(
      { message: "Database query failed." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shop,
      shop_br,
      line_edc,
      lineman,
      robinhood,
      shopeefood,
      grab,
      pre_shop,
    } = body as Partial<BranchMapping>;

    if (
      !shop ||
      !shop_br ||
      !line_edc ||
      !lineman ||
      !robinhood ||
      !shopeefood ||
      !grab
    ) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    const result = await query<BranchMapping>(
      `INSERT INTO bh_branch_map (shop, shop_br, line_edc, lineman, robinhood, shopeefood, grab, pre_shop)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING "index", grab, line_edc, lineman, pre_shop, robinhood, shopeefood, shop, shop_br`,
      [
        shop,
        shop_br,
        line_edc,
        lineman,
        robinhood,
        shopeefood,
        grab,
        pre_shop ?? "BEARHOUSE (แบร์เฮาส์)",
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("[branch-mapping][POST]", error);
    return NextResponse.json(
      { message: "Failed to create branch mapping." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      originalShopBr,
      shopBr,
      shopName,
    }: { originalShopBr?: string; shopBr?: string; shopName?: string } = body;

    if (!originalShopBr || !shopBr || !shopName) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 },
      );
    }

    const result = await query<BranchMapping>(
      `UPDATE bh_branch_map
       SET shop_br = $1, shop = $2
       WHERE shop_br = $3
       RETURNING "index", grab, line_edc, lineman, pre_shop, robinhood, shopeefood, shop, shop_br`,
      [shopBr, shopName, originalShopBr],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("[branch-mapping][PUT]", error);
    return NextResponse.json(
      { message: "Failed to update branch mapping." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { index } = body as { index?: number };

    if (typeof index !== "number") {
      return NextResponse.json(
        { message: "Missing record index." },
        { status: 400 },
      );
    }

    await query(`DELETE FROM bh_branch_map WHERE "index" = $1`, [index]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[branch-mapping][DELETE]", error);
    return NextResponse.json(
      { message: "Failed to delete branch mapping." },
      { status: 500 },
    );
  }
}

