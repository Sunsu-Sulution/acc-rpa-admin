"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useHelperContext } from "./providers/helper-provider";

export function SiteHeader() {
  const { header } = useHelperContext()();

  return (
    <header className="sticky top-0 z-10 w-full flex h-(--header-height) items-center gap-2 border-b bg-background/20 backdrop-blur-md transition-all ease-linear rounded-t-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{header.title}</h1>
      </div>
    </header>
  );
}
