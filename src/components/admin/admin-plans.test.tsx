import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPlans } from "./admin-plans";
import { ToastProvider } from "@/components/ui/toast";
import { INITIAL_ADMIN_STATE } from "@/lib/admin-data";
import { saveAdminPlan } from "@/lib/admin-store";

vi.mock("@/lib/admin-store", () => ({ saveAdminPlan: vi.fn(), saveRechargeTier: vi.fn() }));
afterEach(() => vi.restoreAllMocks());

describe("admin plan save loop", () => {
  it("locks duplicate submissions, preserves failed draft and allows retry", async () => {
    let rejectSave: (error: Error) => void = () => {};
    vi.mocked(saveAdminPlan).mockImplementationOnce(() => new Promise<void>((_, reject) => { rejectSave = reject; }));
    render(<ToastProvider><AdminPlans state={INITIAL_ADMIN_STATE} /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "新建套餐" }));
    fireEvent.change(screen.getByLabelText("套餐名称"), { target: { value: "测试套餐" } });
    const form = screen.getByRole("button", { name: "保存配置" }).closest("form");
    if (!form) throw new Error("Missing form");
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(saveAdminPlan).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "保存中…" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.getByRole("dialog", { name: "套餐配置" })).toBeInTheDocument();
    await act(async () => rejectSave(new Error("测试网络失败")));
    expect(screen.getByLabelText("套餐名称")).toHaveValue("测试套餐");
    expect(screen.getByText(/草稿已保留/)).toBeInTheDocument();
    vi.mocked(saveAdminPlan).mockResolvedValueOnce();
    fireEvent.click(screen.getByRole("button", { name: "保存配置" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "套餐配置" })).not.toBeInTheDocument());
  });
  it("keeps unsaved configuration when discard is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ToastProvider><AdminPlans state={INITIAL_ADMIN_STATE} /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "新建套餐" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "套餐配置" })).toBeInTheDocument();
  });
});
