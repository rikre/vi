import { describe, expect, it } from "vitest";
import {
  ADMIN_ROLE_NAMES,
  hasPermission,
  isReadOnlyPermission,
  normalizeAdminRoles,
  permissionsForRoles,
  SUPPORT_GRANT_CAP,
} from "@/lib/admin/rbac";

describe("admin rbac", () => {
  it("platform_admin 拥有全部权限", () => {
    const permissions = permissionsForRoles(["platform_admin"]);
    expect(permissions.has("models:secret")).toBe(true);
    expect(permissions.has("users:grant")).toBe(true);
    expect(permissions.has("credit-policy:write")).toBe(true);
  });

  it("commercial_ops 不能查看或修改模型密钥", () => {
    expect(hasPermission(["commercial_ops"], "models:secret")).toBe(false);
    expect(hasPermission(["commercial_ops"], "models:write")).toBe(false);
    expect(hasPermission(["commercial_ops"], "plans:write")).toBe(true);
  });

  it("finance 只能读取订单、流水和审计", () => {
    expect(hasPermission(["finance"], "orders:read")).toBe(true);
    expect(hasPermission(["finance"], "usage:read")).toBe(true);
    expect(hasPermission(["finance"], "users:grant")).toBe(false);
    expect(hasPermission(["finance"], "models:write")).toBe(false);
  });

  it("support 可读用户并进行小额补偿，不能改价格与模型", () => {
    expect(hasPermission(["support"], "users:read")).toBe(true);
    expect(hasPermission(["support"], "users:grant")).toBe(true);
    expect(hasPermission(["support"], "plans:write")).toBe(false);
    expect(hasPermission(["support"], "orders:read")).toBe(false);
    expect(SUPPORT_GRANT_CAP).toBe(5_000);
  });

  it("auditor 仅可读审计日志", () => {
    expect(hasPermission(["auditor"], "audit-logs:read")).toBe(true);
    expect(hasPermission(["auditor"], "dashboard:view")).toBe(false);
    expect(hasPermission(["auditor"], "users:read")).toBe(false);
  });

  it("未知角色被过滤，不产生额外权限", () => {
    expect(normalizeAdminRoles(["superuser", "finance", ""])).toEqual(["finance"]);
    expect(normalizeAdminRoles([])).toEqual([]);
    expect(hasPermission(normalizeAdminRoles(["superuser"]), "users:read")).toBe(false);
  });

  it("多角色权限合并", () => {
    const permissions = permissionsForRoles(["support", "auditor"]);
    expect(permissions.has("audit-logs:read")).toBe(true);
    expect(permissions.has("users:grant")).toBe(true);
  });

  it("角色清单覆盖六个管理角色", () => {
    expect(ADMIN_ROLE_NAMES).toHaveLength(6);
  });

  it("只读权限判定", () => {
    expect(isReadOnlyPermission("users:read")).toBe(true);
    expect(isReadOnlyPermission("users:grant")).toBe(false);
    expect(isReadOnlyPermission("models:secret")).toBe(false);
  });
});
