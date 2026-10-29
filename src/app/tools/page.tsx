import { AppShell } from "@/components/layout/app-shell";
import { ToolsStudio } from "@/components/tools/tools-studio";

export default function ToolsPage() {
  return (
    <AppShell hideCourseFab feedbackVariant="tools">
      <ToolsStudio />
    </AppShell>
  );
}
