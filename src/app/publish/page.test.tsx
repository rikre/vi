import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";

vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

import PublishPage from "@/app/publish/page";

describe("PublishPage 组件", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("应渲染 6 个平台卡片，全部显示「未绑定」", () => {
    render(<PublishPage />);
    expect(screen.getByText("绑定发布平台")).toBeInTheDocument();
    expect(screen.getByText("抖音")).toBeInTheDocument();
    expect(screen.getByText("快手")).toBeInTheDocument();
    expect(screen.getByText("小红书")).toBeInTheDocument();
    expect(screen.getByText("哔哩哔哩")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("视频号")).toBeInTheDocument();
    expect(screen.getAllByText("未绑定")).toHaveLength(6);
  });

  it("点击绑定按钮应触发 绑定中→已绑定 状态机", () => {
    render(<PublishPage />);
    const buttons = screen.getAllByText("绑定账号");
    act(() => fireEvent.click(buttons[0]));
    expect(screen.getByText("绑定中...")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));
    const bound = screen.getAllByText("已绑定");
    expect(bound.length).toBeGreaterThanOrEqual(2); // badge + button
  });

  it("已绑定的平台按钮应禁用", () => {
    render(<PublishPage />);
    const buttons = screen.getAllByText("绑定账号");
    act(() => fireEvent.click(buttons[0]));
    act(() => vi.advanceTimersByTime(1200));
    // 找到所有已绑定的按钮，第一个应禁用
    const boundButtons = screen.getAllByRole("button", { name: "已绑定" });
    expect(boundButtons[0]).toBeDisabled();
  });
});
