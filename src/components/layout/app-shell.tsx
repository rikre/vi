"use client";

import { useState } from "react";
import { MenuIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { MessageCenter } from "@/components/message-center";
import { CourseFab } from "@/components/course-fab";
import { ToolsFeedbackDialog } from "@/components/tools/tools-feedback-dialog";

type AppShellProps = {
  children: React.ReactNode;
  /** 顶部活动条（跨侧栏整宽，见线上 campaign-shell-host） */
  banner?: React.ReactNode;
  hideCourseFab?: boolean;
  feedbackVariant?: "default" | "tools";
};

export function AppShell({
  children,
  banner,
  hideCourseFab = false,
  feedbackVariant = "default",
}: AppShellProps) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [toolsFeedbackOpen, setToolsFeedbackOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMsg = () => setMsgOpen(true);

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        {banner}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            onOpenMessages={openMsg}
            onOpenFeedback={feedbackVariant === "tools" ? () => setToolsFeedbackOpen(true) : undefined}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <main className="relative min-h-0 flex-1 overflow-hidden">
              <button
                type="button"
                aria-label="打开菜单"
                onClick={() => setMobileNavOpen(true)}
                className={cn(
                  "absolute left-4 top-4 z-50 flex size-[42px] items-center justify-center rounded-[14px] bg-sidebar/80 text-brand backdrop-blur-sm transition-colors hover:bg-sidebar md:hidden",
                  mobileNavOpen && "hidden"
                )}
              >
                <MenuIcon className="size-5" />
              </button>
              {children}
            </main>
          </div>
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
