import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreditPolicy, EntitlementGrant } from "@/types/admin";

const postGrantMock = vi.fn<(grant: EntitlementGrant, key: string) => Promise<unknown>>();
const patchUserStatusMock = vi.fn<
  (userId: string, status: string, reason: string, key: string) => Promise<unknown>
>();
const patchCreditPolicyMock = vi.fn<(policy: CreditPolicy, key: string) => Promise<unknown>>();

vi.mock("@/lib/admin-api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/admin-api-client")>();
  return {
    ...actual,
    postGrant: (grant: EntitlementGrant, key: string) => postGrantMock(grant, key),
    patchUserStatus: (...args: Parameters<typeof patchUserStatusMock>) => patchUserStatusMock(...args),
    patchCreditPolicy: (policy: CreditPolicy, key: string) => patchCreditPolicyMock(policy, key),
  };
});

import {
  getAdminState,
  grantEntitlement,
  loadAdminState,
  saveCreditPolicy,
  updateAdminUserStatus,
} from "@/lib/admin-store";
import { INITIAL_ADMIN_STATE } from "@/lib/admin-data";

describe("admin store（API 驱动）", () => {
  beforeEach(() => {
    postGrantMock.mockReset();
    patchUserStatusMock.mockReset();
    patchCreditPolicyMock.mockReset();
    // 每个 API mock 默认成功返回
    postGrantMock.mockResolvedValue({ kind: "credits", approvalStatus: "approved" });
    patchUserStatusMock.mockResolvedValue({ status: "risk" });
    patchCreditPolicyMock.mockResolvedValue({});
    // fetchDashboard 等读接口由真实模块触发；将 fetch 置空避免网络请求
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { headers: { "Content-Type": "application/json" } })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("定向加积分调用写接口并携带幂等键", async () => {
    const grant: EntitlementGrant = {
      kind: "credits",
      userId: "U-0001",
      bucket: "enterprise",
      amount: 5_000,
      reason: "合同补充额度",
    };
    await grantEntitlement(grant);
    expect(postGrantMock).toHaveBeenCalledTimes(1);
    const [sentGrant, key] = postGrantMock.mock.calls[0];
    expect(sentGrant).toEqual(grant);
    expect(key).toMatch(/^[\w-]{8,}$/);
  });

  it("大额发放进入审批流时抛出异常且不入账", async () => {
    postGrantMock.mockResolvedValueOnce({ kind: "credits", approvalStatus: "pending" });
    await expect(
      grantEntitlement({ kind: "credits", userId: "U-0001", bucket: "gift", amount: 1_000_000, reason: "大额测试" }),
    ).rejects.toThrow("审批");
  });

  it("用户状态变更携带原因与幂等键", async () => {
    await updateAdminUserStatus("U-0002", "risk", "请求频率异常");
    expect(patchUserStatusMock).toHaveBeenCalledTimes(1);
    const [userId, status, reason, key] = patchUserStatusMock.mock.calls[0];
    expect(userId).toBe("U-0002");
    expect(status).toBe("risk");
    expect(reason).toBe("请求频率异常");
    expect(key).toMatch(/^[\w-]{8,}$/);
  });

  it("积分策略保存透传完整策略", async () => {
    const policy: CreditPolicy = { ...INITIAL_ADMIN_STATE.creditPolicy, creditsPerYuan: 12 };
    await saveCreditPolicy(policy);
    expect(patchCreditPolicyMock).toHaveBeenCalledTimes(1);
    expect(patchCreditPolicyMock.mock.calls[0][0].creditsPerYuan).toBe(12);
  });

  it("读取失败时进入 error 状态并保留初始数据", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "未登录" } }), { status: 401 })),
    );
    await loadAdminState();
    expect(getAdminState()).toEqual(INITIAL_ADMIN_STATE);
  });
});

declare module "@/types/admin" {
  // 类型仅用于测试编译，无需扩展
}
