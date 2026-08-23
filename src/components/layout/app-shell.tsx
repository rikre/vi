"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MessageCenter } from "@/components/message-center";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [msgOpen, setMsgOpen] = useState(false);

  const openMsg = () => setMsgOpen(true);

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <Sidebar onOpenMessages={openMsg} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>

      <MessageCenter open={msgOpen} onClose={() => setMsgOpen(false)} />
    </>
  );
}
