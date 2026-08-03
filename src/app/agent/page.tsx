import { AppShell } from "@/components/layout/app-shell";
import { TeamDashboard } from "@/components/team/team-dashboard";

export const metadata = {
  title: "团队数据",
};

export default function AgentPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto p-6">
        <TeamDashboard />
      </div>
    </AppShell>
  );
}
