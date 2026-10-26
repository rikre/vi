import { AppShell } from "@/components/layout/app-shell";
import { ScriptIcon } from "@/components/icons";

export default function ScriptMarketPage() {
  return (
    <AppShell>
      <main className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <ScriptIcon className="size-10 text-brand" />
        <h1 className="text-xl font-semibold text-foreground">剧本超市</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          高分剧本与全部剧本：按评级、频道、类型、发行市场筛选。
        </p>
        <p className="text-xs text-muted-foreground/60">
          页面建设中，按 Round 4 对齐 Loop 排队实现。
        </p>
      </main>
    </AppShell>
  );
}
