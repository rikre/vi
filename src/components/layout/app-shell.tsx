"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MessageCenter } from "@/components/message-center";
import { CourseFab } from "@/components/course-fab";
import { ToolsFeedbackDialog } from "@/components/tools/tools-feedback-dialog";

type AppShellProps = {
  children: React.ReactNode;
  hideTopBar?: boolean;
  hideCourseFab?: boolean;
  feedbackVariant?: "default" | "tools";
};

export function AppShell({
  children,
  hideTopBar = false,
  hideCourseFab = false,
  feedbackVariant = "default",
}: AppShellProps) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [toolsFeedbackOpen, setToolsFeedbackOpen] = useState(false);

  const openMsg = () => setMsgOpen(true);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar
          onOpenMessages={openMsg}
          onOpenFeedback={feedbackVariant === "tools" ? () => setToolsFeedbackOpen(true) : undefined}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {hideTopBar ? null : <TopBar />}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>

      <MessageCenter open={msgOpen} onClose={() => setMsgOpen(false)} />
      {hideCourseFab ? null : <CourseFab />}
      {feedbackVariant === "tools" ? (
        <ToolsFeedbackDialog open={toolsFeedbackOpen} onClose={() => setToolsFeedbackOpen(false)} />
      ) : null}
    </>
  );
}
