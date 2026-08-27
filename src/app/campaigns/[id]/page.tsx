import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { findCampaign } from "@/components/home/campaign-data";
import { ChevronLeftIcon } from "@/components/icons";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = findCampaign(id);
  if (!campaign) notFound();

  return (
    <AppShell>
      <div className="h-full overflow-y-auto no-scrollbar">
        <div className="mx-auto max-w-[960px] px-6 py-10">
          <Link
            href="/home"
            className="inline-flex items-center gap-1 text-[13px] text-white/60 transition-colors hover:text-white"
          >
            <ChevronLeftIcon className="size-4" />
            返回创作
          </Link>

          <div
            className="mt-4 flex h-[280px] items-end overflow-hidden rounded-2xl"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0) 100%), url(${campaign.coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="w-full p-6">
              <span
                className={
                  campaign.kind === "ongoing"
                    ? "inline-block rounded-full bg-brand px-2.5 py-0.5 text-[12px] font-medium text-black"
                    : "inline-block rounded-full bg-white/[0.12] px-2.5 py-0.5 text-[12px] font-medium text-white/70"
                }
              >
                {campaign.kind === "ongoing" ? "进行中" : "已结束"}
              </span>
              <h1 className="mt-2 text-[24px] font-bold text-white">
                {campaign.title}
              </h1>
              <p className="mt-1 text-[13px] text-white/70">
                {campaign.endsInLabel} · {campaign.participantsLabel}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#141414] p-6 ring-1 ring-white/[0.08]">
            <h2 className="text-[15px] font-semibold text-white">活动详情</h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/70">
              {campaign.description}
            </p>
            {campaign.kind === "ongoing" && (
              <Link
                href="/home"
                className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-5 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
              >
                立即参与
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
