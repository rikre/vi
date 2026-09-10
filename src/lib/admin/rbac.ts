export const ADMIN_ROLE_NAMES = [
  "platform_admin",
  "enterprise_admin",
  "commercial_ops",
  "finance",
  "support",
  "auditor",
] as const;

export type AdminRoleName = (typeof ADMIN_ROLE_NAMES)[number];

export const ADMIN_PERMISSIONS = [
  "dashboard:view",
  "users:read",
  "users:grant",
  "users:status",
  "orders:read",
  "usage:read",
  "plans:read",
  "plans:write",
  "recharge-tiers:read",
  "recharge-tiers:write",
  "models:read",
  "models:write",
  "models:secret",
  "credit-policy:read",
  "credit-policy:write",
  "audit-logs:read",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const READ_ONLY_PREFIXES = ["dashboard:view", "users:read", "orders:read", "usage:read", "plans:read", "recharge-tiers:read", "models:read", "credit-policy:read", "audit-logs:read"];

const ALL_PERMISSIONS: readonly AdminPermission[] = ADMIN_PERMISSIONS;

const ROLE_MATRIX: Record<AdminRoleName, readonly AdminPermission[]> = {
  platform_admin: ALL_PERMISSIONS,
  enterprise_admin: [
    "dashboard:view",
    "users:read",
    "users:grant",
    "users:status",
    "orders:read",
    "usage:read",
    "plans:read",
    "plans:write",
    "recharge-tiers:read",
    "models:read",
    "models:write",
    "credit-policy:read",
    "audit-logs:read",
  ],
  commercial_ops: [
    "dashboard:view",
    "users:read",
    "users:grant",
    "usage:read",
    "plans:read",
    "plans:write",
    "recharge-tiers:read",
    "recharge-tiers:write",
    "models:read",
    "credit-policy:read",
    "audit-logs:read",
  ],
  finance: ["dashboard:view", "orders:read", "usage:read", "audit-logs:read"],
  support: ["users:read", "users:grant", "usage:read"],
  auditor: ["audit-logs:read"],
};

/** 将任意字符串角色列表解析为受支持的管理员角色（忽略未知值）。 */
export function normalizeAdminRoles(roles: readonly string[]): AdminRoleName[] {
  const known = new Set<string>(ADMIN_ROLE_NAMES);
  return roles.filter((role): role is AdminRoleName => known.has(role));
}

/** 汇总多个角色的权限集合。 */
export function permissionsForRoles(roles: readonly AdminRoleName[]): Set<AdminPermission> {
  const permissions = new Set<AdminPermission>();
  for (const role of roles) {
    for (const permission of ROLE_MATRIX[role]) permissions.add(permission);
  }
  return permissions;
}

export function hasPermission(roles: readonly AdminRoleName[], permission: AdminPermission): boolean {
  return permissionsForRoles(roles).has(permission);
}

export function isReadOnlyPermission(permission: AdminPermission): boolean {
  return READ_ONLY_PREFIXES.includes(permission);
}

/** support 角色的小额补偿上限与限定账户。 */
export const SUPPORT_GRANT_CAP = 5_000;
export const SUPPORT_GRANT_BUCKET = "gift" as const;

/** 大额积分发放进入待审批的阈值。 */
export const LARGE_GRANT_APPROVAL_THRESHOLD = 1_000_000;
