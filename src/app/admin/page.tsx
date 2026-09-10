"use client";

import Link from "next/link";
import { AdminConsole } from "@/components/admin/admin-console";
import { AdminCard, ADMIN_PRIMARY_BUTTON } from "@/components/admin/admin-ui";
import { useAuth } from "@/components/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsIcon } from "@/components/icons";

const ADMIN_ROLES = new Set(["platform_admin", "enterprise_admin"]);

export default function AdminPage() {
  const { status, user } = useAuth();
  const canAccess = user?.roles.some((role) => ADMIN_ROLES.has(role)) ?? false;
  return (
    <AppShell>
      {status === "loading" ? <div className="h-full animate-pulse bg-[#0b0b0b] p-6"><div className="h-20 rounded-2xl bg-white/[0.04]" /></div> : canAccess ? <AdminConsole /> : <div className="flex h-full items-center justify-center bg-[#0b0b0b] p-5"><AdminCard className="w-full max-w-[460px] p-7 text-center"><span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger"><SettingsIcon className="size-5" /></span><h1 className="mt-4 text-[20px] font-semibold text-white">无管理员权限</h1><p className="mt-2 text-[12px] leading-relaxed text-white/45">该入口仅向平台管理员和企业管理员开放。请联系平台超级管理员分配角色。</p><Link href="/home" className={`${ADMIN_PRIMARY_BUTTON} mt-6`}>返回创作首页</Link></AdminCard></div>}
    </AppShell>
  );
}
