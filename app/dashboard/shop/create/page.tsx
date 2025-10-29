/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useHelperContext } from "@/components/providers/helper-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addActivityLogs, getSupabaseServiceClient } from "@/lib/database";
import { FormEvent, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const { header, setFullLoading, setAlert, userInfo } = useHelperContext()();
  const formRef = useRef<HTMLFormElement | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    header.setTitle("สร้าง Mapping ใหม่");
  }, []);

  useEffect(() => {
    const shopBRParam = searchParams.get("shop_br") ?? "";
    const shopNameParam = searchParams.get("shop_name") ?? "";
    const form = formRef.current;
    if (!form) return;

    if (shopBRParam) {
      const shopBrInput = form.elements.namedItem(
        "shopBR",
      ) as HTMLInputElement | null;
      if (shopBrInput) {
        shopBrInput.value = shopBRParam;
        shopBrInput.disabled = true;
      }
    }

    if (shopNameParam) {
      const shopNameInput = form.elements.namedItem(
        "shopName",
      ) as HTMLInputElement | null;
      if (shopNameInput) {
        shopNameInput.value = shopNameParam;
        shopNameInput.disabled = true;
      }
    }
  }, [searchParams]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFullLoading(true);
    const form = formRef.current;
    const shopBR = form?.shopBR?.value ?? "";
    const shopName = form?.shopName?.value ?? "";
    const lineEDC = form?.lineEDC?.value ?? "";
    const lineman = form?.lineman?.value ?? "";
    const shopeefood = form?.shopeefood?.value ?? "";
    const grab = form?.grab?.value ?? "";
    const robinhood = form?.robinhood?.value ?? "";

    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("bh_branch_map").insert({
      shop: shopName,
      shop_br: shopBR,
      grab: grab,
      shopeefood: shopeefood,
      lineman: lineman,
      line_edc: lineEDC,
      robinhood: robinhood,
      pre_shop: "BEARHOUSE (แบร์เฮาส์)",
    });

    if (error) {
      setAlert(
        "Error",
        `Database query failed: ${error.message}`,
        () => {
          //   window.location.reload();
        },
        false,
      );
      setFullLoading(false);
    }

    await addActivityLogs(`${userInfo?.email} ได้ทำการสร้าง Mapping ${shopName}(${shopBR})\n- <b>grab:</b> ${grab}\n- <b>shopeefood:</b> ${shopeefood}\n- <b>lineman</b>: ${lineman}\n- <b>lineman:</b> ${lineman}`, "mapping", shopBR);
    window.location.href = `/dashboard/shop/${shopBR}`;
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="m-6">
      <div className="p-6 border rounded-lg">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between">
            <div className="font-bold">สร้าง Mapping ใหม่</div>
            <Button type="submit">บันทึก</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shopBR" className="font-bold">
              Shop BR
            </Label>
            <Input
              id="shopBR"
              name="shopBR"
              type="text"
              placeholder="BR00"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="shopName" className="font-bold">
              Shop name
            </Label>
            <Input
              id="shopName"
              name="shopName"
              type="text"
              placeholder="Central Krabi"
              required
            />
          </div>

          <div className="bg-white p-4 pb-6 shadow-md flex flex-col gap-6 rounded-xl">
            <div className="text-xl font-bold mt-3">Delivery Mapping</div>
            <div className="grid gap-2">
              <Label htmlFor="lineEDC" className="font-bold">
                LINE EDC
              </Label>
              <Input
                id="lineEDC"
                name="lineEDC"
                type="text"
                placeholder="BEARHOUSE (แบร์เฮาส์) Central Hatyai"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lineman" className="font-bold">
                LINE MAN
              </Label>
              <Input
                id="lineman"
                name="lineman"
                type="text"
                placeholder="BEARHOUSE (แบร์เฮาส์) Central Hatyai"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shopeefood" className="font-bold">
                Shopee food
              </Label>
              <Input
                id="shopeefood"
                name="shopeefood"
                type="text"
                placeholder="BEARHOUSE (แบร์เฮาส์) Central Hatyai"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grab" className="font-bold">
                Grab
              </Label>
              <Input
                id="grab"
                name="grab"
                type="text"
                placeholder="BEARHOUSE (แบร์เฮาส์) Central Hatyai"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="robinhood" className="font-bold">
                Robinhood
              </Label>
              <Input
                id="robinhood"
                name="robinhood"
                type="text"
                placeholder="BEARHOUSE (แบร์เฮาส์) Central Hatyai"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">บันทึก</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
