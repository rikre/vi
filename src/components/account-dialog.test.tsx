import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountDialog, AiWatermarkDialog } from "./account-dialog";

const logout = vi.fn();

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    user: {
      id: "mock-user-001",
      nickname: "本地体验用户",
      phone: "13800138000",
      email: "mock@bollo.video",
    },
    logout,
  }),
}));

function renderAccount(initialTab: "profile" | "points" | "invite" = "profile") {
  return render(
    <AccountDialog
      open
      initialTab={initialTab}
      onClose={vi.fn()}
      onOpenWatermark={vi.fn()}
    />,
  );
}

describe("账户管理 Arco 控件与 Mock 数据", () => {
  beforeEach(() => {
    logout.mockClear();
  });

  it("编辑并保存昵称", async () => {
    const user = userEvent.setup();
    renderAccount();

    await user.click(screen.getByRole("button", { name: "修改昵称" }));
    const input = screen.getByRole("textbox", { name: "昵称" });
    await user.clear(input);
    await user.type(input, "新的本地昵称");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByText("新的本地昵称")).toBeInTheDocument();
    expect(screen.getByText("用户编号：mock-user-001")).toBeInTheDocument();
  });

  it("校验换绑手机号的空值、错误验证码和成功状态", async () => {
    const user = userEvent.setup();
    renderAccount();

    await user.click(screen.getByRole("button", { name: "更换手机号" }));
    await user.click(screen.getByRole("button", { name: "发送验证码" }));
    expect(screen.getByRole("alert")).toHaveTextContent("请先填写账号");

    await user.type(screen.getByRole("textbox", { name: "新手机号" }), "13900001111");
    await user.click(screen.getByRole("button", { name: "发送验证码" }));
    await user.type(screen.getByRole("textbox", { name: "验证码" }), "000000");
    await user.click(screen.getByRole("button", { name: "确认更换" }));
    expect(screen.getByRole("alert")).toHaveTextContent("验证码不正确");

    await user.clear(screen.getByRole("textbox", { name: "验证码" }));
    await user.type(screen.getByRole("textbox", { name: "验证码" }), "123456");
    await user.click(screen.getByRole("button", { name: "确认更换" }));
    expect(screen.getByText("13900001111")).toBeInTheDocument();
  });

  it("按单号筛选积分记录，空结果后可重置", async () => {
    const user = userEvent.setup();
    renderAccount("points");

    expect(screen.getByRole("table", { name: "积分明细" })).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "单号查询" }), "不存在的单号");
    await user.click(screen.getByRole("button", { name: "查询" }));
    expect(screen.getByText("该时间范围内暂无记录")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置" }));
    expect(screen.getByText("145303")).toBeInTheDocument();
    expect(screen.queryByText("该时间范围内暂无记录")).not.toBeInTheDocument();
  });

  it("复制邀请码并给出一致反馈", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    renderAccount("invite");

    await user.click(screen.getByRole("button", { name: "复制邀请码" }));
    expect(writeText).toHaveBeenCalledWith("MIV7AL56CFXRMVT");
    expect(screen.getByRole("button", { name: "已复制" })).toBeInTheDocument();
  });

  it("水印子弹框打开时 Esc 只关闭最上层", async () => {
    function NestedDialogs() {
      const [accountOpen, setAccountOpen] = useState(true);
      const [watermarkOpen, setWatermarkOpen] = useState(true);
      return (
        <>
          {accountOpen ? (
            <AccountDialog
              open
              onClose={() => setAccountOpen(false)}
              onOpenWatermark={() => setWatermarkOpen(true)}
            />
          ) : null}
          {watermarkOpen ? <AiWatermarkDialog onClose={() => setWatermarkOpen(false)} /> : null}
        </>
      );
    }
    const user = userEvent.setup();
    render(<NestedDialogs />);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "生成内容水印设置" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "账户管理" })).toBeInTheDocument();
  });

  it("切换水印并保存设置", async () => {
    const user = userEvent.setup();
    render(<AiWatermarkDialog onClose={vi.fn()} />);

    const control = screen.getByRole("switch", { name: "去除生成水印" });
    expect(control).toHaveAttribute("aria-checked", "true");
    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.click(screen.getByRole("button", { name: "保存设置" }));
    expect(screen.getByRole("button", { name: "已保存" })).toBeInTheDocument();
  });
});
