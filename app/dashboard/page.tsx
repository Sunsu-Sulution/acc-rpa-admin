/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { DataTable } from "@/components/datatable/datatable";
import { useHelperContext } from "@/components/providers/helper-provider";
import { getSupabaseServiceClient } from "@/lib/database";
import { ErrorResponse, PaginatedResponse } from "@/types/lark";
import { BranchMapping } from "@/types/database";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { header, setAlert, setFullLoading } = useHelperContext()();
  const [allBranchData, setAllBranchData] = useState<BranchMapping[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    header.setTitle("Branch Mapping");
    fetchAllBranchData();
  }, []);

  const fetchAllBranchData = async () => {
    setFullLoading(true);
    const supabase = getSupabaseServiceClient();
    const { data, error: queryError } = await supabase
      .from("bh_branch_map")
      .select();

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

    setAllBranchData(data || []);
    setIsDataLoaded(true);
    setFullLoading(false);
  };

  const fetchBranch = async (
    limit: number,
    offset: number | "",
    filter: string,
  ): Promise<PaginatedResponse<BranchMapping> | ErrorResponse> => {
    let filteredData = allBranchData;
    if (filter) {
      filteredData = allBranchData.filter(
        (item) =>
          item.grab?.toLowerCase().includes(filter.toLowerCase()) ||
          item.line_edc?.toLowerCase().includes(filter.toLowerCase()) ||
          item.lineman?.toLowerCase().includes(filter.toLowerCase()) ||
          item.pre_shop?.toLowerCase().includes(filter.toLowerCase()) ||
          item.robinhood?.toLowerCase().includes(filter.toLowerCase()) ||
          item.shop?.toLowerCase().includes(filter.toLowerCase()) ||
          item.shop_br?.toLowerCase().includes(filter.toLowerCase()) ||
          item.shopeefood?.toLowerCase().includes(filter.toLowerCase()),
      );
    }

    const groupedData = filteredData.reduce((groups, item) => {
      const shopBr = item.shop_br || "Unknown";
      if (!groups[shopBr]) {
        groups[shopBr] = [];
      }
      groups[shopBr].push(item);
      return groups;
    }, {} as Record<string, BranchMapping[]>);

    const summaryData: BranchMapping[] = Object.keys(groupedData).map(
      (shopBr) => {
        const items = groupedData[shopBr];
        const firstItem = items[0];

        const uniqueShops = [
          ...new Set(items.map((item) => item.shop).filter(Boolean)),
        ];

        return {
          ...firstItem,
          shop: uniqueShops.join(", "),
          shop_br: shopBr,
        };
      },
    );

    summaryData.sort((a, b) => {
      const shopBrA = a.shop_br || "";
      const shopBrB = b.shop_br || "";
      return shopBrA.localeCompare(shopBrB);
    });

    const startIndex = offset === "" ? 0 : offset;
    const endIndex = startIndex + limit;
    const paginatedData = summaryData.slice(startIndex, endIndex);

    const nextOffset = endIndex < summaryData.length ? endIndex : -1;

    return {
      datas: paginatedData,
      next: nextOffset,
    };
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between item-center">
        <h1 className="text-2xl font-bold">Branch Mapping</h1>
        <Button
          onClick={() => {
            window.location.href = "/dashboard/shop/create";
          }}
        >
          สร้าง Mapping ใหม่
        </Button>
      </div>
      {isDataLoaded && (
        <DataTable
          fetchData={fetchBranch}
          columns={[
            { key: "shop_br", label: "Shop BR" },
            { key: "shop", label: "Shop" },
            // { key: "grab", label: "Grab" },
            { key: "line_edc", label: "Line EDC" },
            // { key: "lineman", label: "Lineman" },
            // { key: "pre_shop", label: "Pre Shop" },
            // { key: "robinhood", label: "Robinhood" },
            // { key: "shopeefood", label: "ShopeeFood" },
          ]}
          href="/dashboard/shop/"
          navigateKey="shop_br"
        />
      )}
    </div>
  );
}
