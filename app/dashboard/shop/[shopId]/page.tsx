/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { DataTable } from "@/components/datatable/datatable";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Button } from "@/components/ui/button";
import { getSupabaseServiceClient } from "@/lib/database";
import { BranchMapping } from "@/types/database";
import { ErrorResponse, PaginatedResponse } from "@/types/lark";
import { use, useEffect, useState } from "react";
type PageProps = {
  params: Promise<{ shopId: string }>;
};

export default function Page({ params }: PageProps) {
  const { shopId } = use(params);
  const { header, setAlert, setFullLoading } = useHelperContext()();
  const [allBranchData, setAllBranchData] = useState<BranchMapping[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [shopName, setShopName] = useState("");

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
    setAllBranchData(data || []);
    setIsDataLoaded(true);
    setFullLoading(false);
  };

  const fetchBranch = async (
    limit: number,
    offset: number | "",
    // filter: string = "",
  ): Promise<PaginatedResponse<BranchMapping> | ErrorResponse> => {
    const summaryData: BranchMapping[] = allBranchData;

    const startIndex = offset === "" ? 0 : offset;
    const endIndex = startIndex + limit;
    const paginatedData = summaryData.slice(startIndex, endIndex);

    const nextOffset = endIndex < summaryData.length ? endIndex : -1;

    return {
      datas: paginatedData,
      next: nextOffset,
    };
  };

  useEffect(() => {
    header.setTitle(`${shopId} - ${shopName}`);
    fetchAllBranchData();
  }, [shopName]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between item-center">
        <div className="text-2xl font-bold">{shopName}</div>
        <Button
          onClick={() => {
            window.location.href = `/dashboard/shop/create?shop_br=${shopId}&shop_name=${shopName}`;
          }}
        >
          เพิ่ม Delivery Mapping
        </Button>
      </div>
      <div className="bg-white rounded-3xl shadow-md p-5">
        <div className="text-md font-bold">Delivery Name Mapping</div>

        {isDataLoaded && (
          <DataTable
            fetchData={fetchBranch}
            columns={[
              { key: "grab", label: "Grab" },
              { key: "lineman", label: "Lineman" },
              { key: "robinhood", label: "Robinhood" },
              { key: "shopeefood", label: "ShopeeFood" },
            ]}
            hideSearch
          />
        )}
      </div>
    </div>
  );
}
