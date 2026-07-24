"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { SubscriptionDialog } from "@/components/subscription-dialog";
import { MessageCenter } from "@/components/message-center";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [subOpen, setSubOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

  const openSub = () => setSubOpen(true);
  const openMsg = () => setMsgOpen(true);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar onOpenSubscription={openSub} onOpenMessages={openMsg} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>

      <SubscriptionDialog open={subOpen} onClose={() => setSubOpen(false)} />
      <MessageCenter open={msgOpen} onClose={() => setMsgOpen(false)} />
    </>
  );
}
