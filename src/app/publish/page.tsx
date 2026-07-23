import { AppShell } from "@/components/layout/app-shell";
import { PublishIcon } from "@/components/icons";

const PLATFORMS = [
  {
    id: "douyin",
    name: "抖音",
    desc: "短视频平台，触达国内年轻用户",
    status: "未绑定",
  },
  {
    id: "kuaishou",
    name: "快手",
    desc: "短视频社区，下沉市场覆盖广",
    status: "未绑定",
  },
  {
    id: "xiaohongshu",
    name: "小红书",
    desc: "生活方式社区，女性用户为主",
    status: "未绑定",
  },
  {
    id: "bilibili",
    name: "哔哩哔哩",
    desc: "中长视频平台，ACG 文化聚集地",
    status: "未绑定",
  },
  {
    id: "youtube",
    name: "YouTube",
    desc: "全球视频平台，触达海外观众",
    status: "未绑定",
  },
  {
    id: "wechat",
    name: "视频号",
    desc: "微信生态内视频发布渠道",
    status: "未绑定",
  },
];

export default function PublishPage() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <header className="mt-8 mb-8 pt-2">
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">
            发布中心
          </h1>
          <p className="mt-2 text-[14px] text-white/50">
            一键将作品分发到多个平台
          </p>
        </header>

        <div className="mb-8 rounded-2xl bg-card p-6 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <PublishIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white">绑定发布平台</h2>
              <p className="mt-0.5 text-[13px] text-white/55">
                绑定后可批量发布作品到多个平台
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-white/[0.06]"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-white">{p.name}</h3>
                <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-white/60">
                  {p.status}
                </span>
              </div>
              <p className="text-[13px] text-white/55">{p.desc}</p>
              <button
                type="button"
                className="mt-auto inline-flex h-9 items-center justify-center rounded-xl bg-white/[0.08] text-[13px] font-medium text-white transition-colors hover:bg-white/[0.12]"
              >
                绑定账号
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="text-[14px] text-white/50">
            暂无可发布作品，请先在
            <a href="/project" className="mx-1 text-brand hover:underline">项目页</a>
            完成创作
          </p>
        </div>
      </div>
    </AppShell>
  );
}
