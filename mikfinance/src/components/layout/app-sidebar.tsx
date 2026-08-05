"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Link from "next/link";
import {
  ArrowRightLeftIcon,
  LayoutDashboardIcon,
  WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    label: "Dashboard",
    icon: <LayoutDashboardIcon />,
    href: "/dashboard",
  },
  {
    label: "Transaction",
    icon: <ArrowRightLeftIcon />,
    href: "/dashboard/Transaction",
  },
];
export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="gap-2 flex-row items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <WalletIcon className="text-emerald-600 size-5!" />
                <h1 className="text-2xl font-bold text-primary">MikFinance</h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.label}
                  className={cn(
                    "py-6 px-5 text-md",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground font-semibold hover:bg-primary hover:text-primary-foreground"
                      : "",
                  )}
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
