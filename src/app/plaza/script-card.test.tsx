import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import { ScriptCard } from "@/app/plaza/script-card";
import type { Script } from "@/lib/plaza-data";

const mockScript: Script = {
  id: "test-1",
  title: "测试剧本标题",
  subtitle: "测试副标题",
  type: "original",
  episodes: 30,
  words: "3万字",
  price: 5000,
  tags: ["甜宠", "复仇"],
  prompt: "test prompt",
  sold: false,
  source: "原创",
  author: "测试编剧",
};

describe("ScriptCard 组件", () => {
  it("应渲染剧本标题、价格和标签", () => {
    render(<ScriptCard script={mockScript} />);
    expect(screen.getByText("测试剧本标题")).toBeInTheDocument();
    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("甜宠")).toBeInTheDocument();
    expect(screen.getByText("复仇")).toBeInTheDocument();
  });

  it("未售出剧本应显示「立即购买」", () => {
    render(<ScriptCard script={mockScript} />);
    expect(screen.getByText("立即购买")).toBeInTheDocument();
  });

  it("已售出剧本应显示「已售出」徽章和按钮", () => {
    render(<ScriptCard script={{ ...mockScript, sold: true }} />);
    const soldBadges = screen.getAllByText("已售出");
    expect(soldBadges.length).toBeGreaterThanOrEqual(2);
  });

  it("应包含指向详情页的链接", () => {
    render(<ScriptCard script={mockScript} />);
    const link = screen.getByRole("link", { name: /查看剧本.*测试剧本标题.*详情/ });
    expect(link).toHaveAttribute("href", "/plaza/script/test-1");
  });

  it("应显示试读剧本按钮", () => {
    render(<ScriptCard script={mockScript} />);
    expect(screen.getByText("试读剧本")).toBeInTheDocument();
  });
});
