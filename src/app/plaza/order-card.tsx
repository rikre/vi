"use client";

import { cn } from "@/lib/utils";

const txi = (prompt: string, size: string) =>
  `https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${size}`;

export type Order = {
  id: string;
  title: string;
  tags: string[];
  income: string;
  model: string;
  perMin: string;
  total: string;
  cycle: string;
  region: string;
  status: "open" | "full" | "pending";
  synopsis: string;
  prompt: string;
};

export const ORDERS: Order[] = [
  {
    id: "1",
    title: "买下黑市后，暴君继子强夺了我",
    tags: ["女频", "打脸逆袭"],
    income: "¥58,500.00",
    model: "保底+分成",
    perMin: "保底1300元/min",
    total: "每集1.5min 共30集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "full",
    synopsis:
      "女主重生后利用前世记忆，在黑市拍卖会上买下关键情报，一步步瓦解暴君继子的势力，最终夺回属于自己的一切。",
    prompt:
      "chinese dark romance drama poster, powerful villain and heroine, no text",
  },
  {
    id: "2",
    title: "飞升后，误入低武世界",
    tags: ["男频", "打脸逆袭"],
    income: "¥135,000.00",
    model: "保底+分成",
    perMin: "保底1500元/min",
    total: "每集1.5min 共60集",
    cycle: "国内",
    region: "A级及以上可接",
    status: "full",
    synopsis:
      "大乘期修士飞升失败，意外进入灵气枯竭的低武世界。面对蝼蚁般的武者，他如何用仙家手段碾压一切，重建飞升之路。",
    prompt:
      "chinese xianxia fantasy poster, immortal in low martial world, no text",
  },
  {
    id: "3",
    title: "兽王的猎物",
    tags: ["女频", "奇幻虐恋"],
    income: "¥29,700.00",
    model: "保底+分成",
    perMin: "保底600元/min",
    total: "每集1.5min 共33集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "open",
    synopsis:
      "被献祭给兽王的少女，意外发现这位传说中的暴君竟是幼年救过自己的少年。在权力与情感的漩涡中，两人逐渐靠近。",
    prompt:
      "chinese fantasy beast king romance poster, heroine and beast king, no text",
  },
  {
    id: "4",
    title: "恶魔勋爵的禁忌游戏",
    tags: ["女频", "复仇虐甜"],
    income: "¥30,000.00",
    model: "保底+分成",
    perMin: "保底500元/min",
    total: "每集1.5min 共40集",
    cycle: "海外",
    region: "A级及以上可接",
    status: "pending",
    synopsis:
      "为报家族血仇，她主动接近恶魔勋爵，却在步步为营中动了真心。当真相揭开，这场禁忌游戏究竟谁才是猎物。",
    prompt:
      "western gothic noble romance poster, demon lord and heroine, no text",
  },
];

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const config = {
    open: {
      label: "可申请",
      color: "text-[#7dffe6] bg-[#00e5c8]/15 ring-[#00e5c8]/30",
    },
    full: {
      label: "名额已满",
      color: "text-white/60 bg-white/[0.06] ring-white/10",
    },
    pending: {
      label: "暂不可申请",
      color: "text-white/60 bg-white/[0.06] ring-white/10",
    },
  };
  const { label, color } = config[status];
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1",
        color,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "open" ? "bg-[#00e5c8]" : "bg-white/40",
        )}
      />
      {label}
    </span>
  );
}

export function OrderCard({
  order,
  onClick,
}: {
  order: Order;
  onClick: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/20 hover:shadow-lg hover:shadow-black/20">
      <div className="relative h-[140px] overflow-hidden">
        <img
          src={txi(order.prompt, "landscape_4_3")}
          alt={order.title}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {order.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="line-clamp-1 text-[15px] font-bold text-white">
            {order.title}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-white/40">预估收益</div>
            <div className="text-[16px] font-bold text-[#00e5c8]">
              {order.income}
              <span className="text-[11px] font-normal text-white/50">
                {" "}
                /部
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40">合作模式</div>
            <div className="text-[12px] font-medium text-white/80">
              {order.model}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-2 text-[11px] text-white/55">
          <div>{order.perMin}</div>
          <div>{order.total}</div>
          <div>{order.cycle}</div>
          <div>{order.region}</div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <OrderStatusBadge status={order.status} />
          <button
            type="button"
            onClick={onClick}
            className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
