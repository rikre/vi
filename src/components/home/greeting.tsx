"use client";

import { useEffect, useState } from "react";
import { WaveHand } from "@/components/icons";

function getGreeting(hour: number): string {
  if (hour >= 6 && hour <= 11) return "早上好，导演！";
  if (hour >= 12 && hour <= 17) return "下午好，导演！";
  if (hour >= 18 && hour <= 23) return "晚上好，导演！";
  return "凌晨好，导演！";
}

export function Greeting() {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  return (
    <div className="mt-20">
      <div className="inline-flex items-start gap-2">
        <span className="inline-flex size-14 shrink-0 items-center justify-center">
          <WaveHand />
        </span>
        <h1 className="text-[32px] font-bold leading-[32px] text-foreground">
          {greeting ?? "\u00A0"}
        </h1>
      </div>
    </div>
  );
}
