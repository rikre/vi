import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatLikeCount,
  TheaterPlayer,
  type TheaterDetail,
  type TheaterService,
} from "./theater-player";

const VIDEO_URL = "https://cdn.example.com/demo.mp4";

function buildDetail(): TheaterDetail {
  const works = [
    "手握八十万镇北军",
    "穿到现代当武替",
    "天降小福星",
  ].map((title, i) => ({
    id: `w${i + 1}`,
    title,
    author: "凤麟文化",
    type: "AI短剧",
    ai: true,
    poster: `/images/home/theater-${i + 1}.webp`,
    epCount: "正片",
    liked: false,
    likeCount: i === 0 ? 25600 : 903 * (i + 1),
    episodes: [
      {
        id: `ep-${i + 1}`,
        name: title,
        time: `2026.10.${20 + i}`,
        poster: `/images/home/theater-${i + 1}.webp`,
        src: VIDEO_URL,
        pending: null,
      },
    ],
  }));
  return { work: works[0], works };
}

function makeService(behavior: Partial<Record<"delay" | "fail", boolean>> = {}): TheaterService {
  return {
    async getDrama(id: string) {
      if (behavior.delay) await new Promise((resolve) => setTimeout(resolve, 300));
      if (behavior.fail || id !== "w1") throw new Error("剧目不存在或已下架");
      return buildDetail();
    },
  };
}

function getTopbar() {
  return screen.getByLabelText("播放顶栏");
}
function getStrip() {
  return screen.getByLabelText("选集与相关作品");
}
function getVideo() {
  return document.querySelector("video") as HTMLVideoElement;
}
/** jsdom 的 play mock 不派发事件，手动广播以驱动 React onPlay */
function emitPlay() {
  getVideo().dispatchEvent(new Event("play"));
}

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
  Element.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  document.title = "";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatLikeCount", () => {
  it("1w 以上缩写为 x.xw，其余原样", () => {
    expect(formatLikeCount(25600)).toBe("2.6w");
    expect(formatLikeCount(903)).toBe("903");
    expect(formatLikeCount(0)).toBe("0");
  });
});

describe("TheaterPlayer（九霄 DramaDetailPlayer 移植）", () => {
  it("渲染顶栏：返回、作者胶囊、AI 标识、更新时间、点赞分享", async () => {
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(getTopbar()).toBeInTheDocument());
    expect(screen.getByRole("link", { name: "返回" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看作者 凤麟文化" })).toBeInTheDocument();
    expect(screen.getByText("含 AI 生成内容")).toBeInTheDocument();
    expect(screen.getByText(/更新时间：/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "点赞" })).toHaveTextContent("2.6w");
    expect(screen.getByRole("button", { name: "分享" })).toBeInTheDocument();
  });

  it("选集条 = 不同剧目之间的切换，各自保持剧目名与封面", async () => {
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(getStrip()).toBeInTheDocument());
    const cards = within(getStrip()).getAllByRole("button");
    // 一部剧目一张卡，不存在「第 N 集」
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute("aria-current", "true");
    expect(cards[0]).toHaveTextContent("手握八十万镇北军");
    expect(cards[1]).toHaveTextContent("穿到现代当武替");
    expect(cards.map((card) => card.textContent)).not.toContain(expect.stringContaining("第"));
    // 各卡保持各自封面（alt="" 的展示图无 img role，直接查 DOM）
    const posters = getStrip().querySelectorAll("img");
    expect(Array.from(posters).map((img) => img.getAttribute("src"))).toEqual([
      "/images/home/theater-1.webp",
      "/images/home/theater-2.webp",
      "/images/home/theater-3.webp",
    ]);
    expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument();
  });

  it("点其他剧目卡切换并尝试自动播放", async () => {
    const user = userEvent.setup();
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(getStrip()).toBeInTheDocument());
    await user.click(within(getStrip()).getByRole("button", { name: /穿到现代当武替/ }));

    expect(getVideo().getAttribute("src")).toBe(VIDEO_URL);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
    // 顶栏标题切换为新剧目
    await waitFor(() => expect(getTopbar().textContent).toContain("穿到现代当武替"));
  });

  it("点赞切换选中态与计数", async () => {
    const user = userEvent.setup();
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "点赞" })).toBeInTheDocument());
    const like = screen.getByRole("button", { name: "点赞" });
    expect(like).toHaveTextContent("2.6w");

    await user.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(like).toHaveTextContent("2.6w"); // 25601 → 2.6w

    await user.click(like);
    expect(like).toHaveAttribute("aria-pressed", "false");
  });

  it("分享复制链接并提示", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "分享" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "分享" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("id=w1"));
    expect(await screen.findByText("链接已复制，快去分享吧")).toBeInTheDocument();
  });

  it("加载中显示状态层，完成后出现播放器", async () => {
    render(<TheaterPlayer dramaId="w1" service={makeService({ delay: true })} />);

    await waitFor(() => expect(screen.getByText("正在加载内容…")).toBeInTheDocument());

    await waitFor(() => expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument());
    expect(screen.queryByText("正在加载内容…")).not.toBeInTheDocument();
  });

  it("未知剧目显示错误态与重试", async () => {
    render(<TheaterPlayer dramaId="w9" service={makeService()} />);

    expect(await screen.findByText("内容不存在或已下架")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重新加载" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "← 返回" })).toBeInTheDocument();
  });

  it("沉浸模式：播放 2s 后隐藏控件，点视频唤回", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "播放" }));
    emitPlay();

    // 播放 2s → 控件隐藏
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(getTopbar().className).toContain("invisible"));
    expect(getTopbar().className).toContain("pointer-events-none");
    expect(getStrip().className).toContain("invisible");

    // 沉浸时点视频 → 唤回控件
    await user.click(getVideo());
    await waitFor(() => expect(getTopbar().className).not.toContain("invisible"));
  });

  it("空格键在播放器聚焦时切换播放", async () => {
    const user = userEvent.setup();
    render(<TheaterPlayer dramaId="w1" service={makeService()} />);

    await waitFor(() => expect(screen.getByRole("button", { name: "播放" })).toBeInTheDocument());
    screen.getByLabelText("短剧播放器").focus();
    await user.keyboard(" ");

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled();
  });
});
