/* eslint-disable react/no-string-refs */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ActivityLog from "@/components/activity-log";
import { DataTable } from "@/components/datatable/datatable";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addActivityLogs, getSupabaseServiceClient } from "@/lib/database";
import { BranchMapping } from "@/types/database";
import { ErrorResponse, PaginatedResponse } from "@/types/lark";
import { IconTrashFilled } from "@tabler/icons-react";
import { FormEvent, ReactNode, use, useEffect, useRef, useState } from "react";

type PageProps = {
  params: Promise<{ shopId: string }>;
};

export default function Page({ params }: PageProps) {
  const { shopId } = use(params);
  const { header, setAlert, setFullLoading, userInfo } = useHelperContext()();
  const [allBranchData, setAllBranchData] = useState<BranchMapping[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [shopName, setShopName] = useState("");
  const [oldShopName, setOldShopName] = useState("");
  const [shopBR, setShopBR] = useState(shopId);
  const formRef = useRef<HTMLFormElement | null>(null);

  type RowType = BranchMapping & { action: ReactNode };

  const fetchAllBranchData = async () => {
    setFullLoading(true);
    const supabase = getSupabaseServiceClient();
    const { data, error: queryError } = await supabase
      .from("bh_branch_map")
      .select()
      .eq("shop_br", shopId);

    if (queryError) {
      setAlert(
        "Error",
        `Database query failed: ${queryError.message}`,
        () => {
          window.location.reload();
        },
        false,
      );
      setFullLoading(false);
      return;
    }

    if (data.length < 1) {
      window.location.href = "/dashboard";
      return;
    }

    setShopName(data[0].shop);
    setOldShopName(data[0].shop);
    setAllBranchData(data || []);
    setIsDataLoaded(true);
    setFullLoading(false);
  };

  const handleDelete = async (mapping: BranchMapping) => {
    if (allBranchData.length <= 1) {
      setAlert(
        "Error",
        "ต้องมีอย่างน้อย 1 mapping ไม่สามารถลบอันสุดท้ายได้",
        () => {},
        false,
      );
      return;
    }

    setAlert(
      "คุณต้องการลบ mapping นี้ใช่หรือไม่",
      "กรุณายืนยันก่อนทำการลบ",
      async () => {
        setFullLoading(true);
        try {
          const supabase = getSupabaseServiceClient();
          const { error } = await supabase
            .from("bh_branch_map")
            .delete()
            .eq("index", mapping.index);

          if (error) {
            setAlert(
              "Error",
              `Delete failed: ${error.message}`,
              () => {},
              false,
            );
            return;
          }

          await addActivityLogs(
            `${userInfo?.email} ได้ทำการลบ Delivery Mapping\n- <b>Grab</b>: ${mapping.grab}\n- <b>Lineman</b>: ${mapping.lineman}\n- <b>Robinhood</b>: ${mapping.robinhood}\n- <b>ShopeeFood</b>: ${mapping.shopeefood}`,
            "mapping",
            shopId,
          );

          setAlert(
            "Success",
            "ลบสำเร็จ",
            () => {
              window.location.reload();
            },
            false,
          );
        } finally {
          setFullLoading(false);
        }
      },
      true,
    );
  };

  const fetchBranch = async (
    limit: number,
    offset: number | "",
  ): Promise<PaginatedResponse<RowType> | ErrorResponse> => {
    const summaryData: BranchMapping[] = allBranchData;
    const startIndex = offset === "" ? 0 : offset;
    const endIndex = startIndex + limit;
    const paginatedData: RowType[] = summaryData
      .slice(startIndex, endIndex)
      .map((item) => ({
        ...item,
        action: (
          <Button
            variant="destructive"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            disabled={allBranchData.length <= 1}
          >
            <IconTrashFilled />
          </Button>
        ),
      }));
    const nextOffset = endIndex < summaryData.length ? endIndex : -1;

    return {
      datas: paginatedData,
      next: nextOffset,
    };
  };

  useEffect(() => {
    header.setTitle(shopId);
    fetchAllBranchData();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFullLoading(true);
    try {
      const supabase = getSupabaseServiceClient();
      if (shopBR !== shopId) {
        const { data: dupData, error: dupError } = await supabase
          .from("bh_branch_map")
          .select("shop_br")
          .eq("shop_br", shopBR)
          .limit(1);

        if (dupError) {
          setAlert(
            "Error",
            `Validation failed: ${dupError.message}`,
            () => {},
            false,
          );
          return;
        }

        if (dupData && dupData.length > 0) {
          setAlert("Error", "มี Shop BR นี้อยู่แล้วในระบบ", () => {}, false);
          return;
        }
      }
      const { error } = await supabase
        .from("bh_branch_map")
        .update({ shop_br: shopBR, shop: shopName })
        .eq("shop_br", shopId);

      if (error) {
        setAlert("Error", `Update failed: ${error.message}`, () => {}, false);
        return;
      }

      if (oldShopName != shopName) {
        await addActivityLogs(
          `${userInfo?.email} ได้ทำการอัพเดท Shop name\n- ${oldShopName} -> ${shopName}`,
          "mapping",
          shopBR,
        );
      }

      setAlert(
        "Success",
        "อัปเดตสำเร็จ",
        () => {
          window.location.reload();
        },
        false,
      );
    } finally {
      setFullLoading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="container mx-auto p-6">
      <div className="flex justify-between item-center">
        <div className="text-2xl font-bold">{oldShopName}</div>
        <Button type="submit">บันทึก</Button>
      </div>
      <div className="bg-white rounded-3xl shadow-md p-5">
        <div className="grid gap-2">
          <Label htmlFor="shopBR" className="font-bold">
            Shop BR
          </Label>
          <Input
            id="shopBR"
            name="shopBR"
            type="text"
            value={shopBR}
            onChange={(e) => setShopBR(e.target.value)}
            placeholder="BR00"
            disabled
            required
          />
        </div>
        <div className="grid gap-2 mt-4">
          <Label htmlFor="shopName" className="font-bold">
            Shop name
          </Label>
          <Input
            id="shopName"
            name="shopName"
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Central Krabi"
            required
          />
        </div>
        {isDataLoaded && (
          <DataTable<RowType>
            fetchData={fetchBranch}
            columns={[
              { key: "grab", label: "Grab" },
              { key: "lineman", label: "Lineman" },
              { key: "robinhood", label: "Robinhood" },
              { key: "shopeefood", label: "ShopeeFood" },
              { key: "action", label: "Action" },
            ]}
            hideSearch
          />
        )}
        <div className="flex justify-end mt-4">
          <Button
            type="button"
            onClick={() => {
              window.location.href = `/dashboard/shop/create?shop_br=${shopId}&shop_name=${shopName}`;
            }}
          >
            เพิ่ม Delivery Mapping
          </Button>
        </div>
      </div>
      <ActivityLog ref="mapping" refId={shopId} />
    </form>
  );
}
