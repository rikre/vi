"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PRIMARY_BUTTON,
  ADMIN_SECONDARY_BUTTON,
  EmptyState,
  SectionTitle,
} from "@/components/admin/admin-ui";
import {
  BuildingIcon,
  CoinsIcon,
  CrownIcon,
  EditIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import {
  addAdminOrganizationMember,
  changeAdminOrganizationAdmin,
  createAdminEnterpriseOrder,
  fetchAdminOrganizationMembers,
  removeAdminOrganizationMember,
  saveAdminOrganization,
  searchAdminUsers,
} from "@/lib/admin-store";
import { computeEnterpriseOrderPricing, discountLabel } from "@/lib/enterprise-pricing";
import { cn } from "@/lib/utils";
import type {
  AdminOrganization,
  AdminOrganizationMember,
  AdminOrganizationMembers,
  AdminState,
  AdminUser,
} from "@/types/admin";

const ORG_STATUS = { active: "正常", suspended: "暂停", closed: "关闭" } as const;

/** 分 → 元 显示（保留两位小数）。 */
function centToYuan(cent: number): string {
  return (cent / 100).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function AdminOrganizations({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  /** 编辑弹框目标：null=关闭，"new"=新建 */
  const [editing, setEditing] = useState<AdminOrganization | "new" | null>(null);
  const [orderOrg, setOrderOrg] = useState<AdminOrganization | null>(null);
  /** 成员管理弹框目标企业 */
  const [membersOrg, setMembersOrg] = useState<AdminOrganization | null>(null);

  const stats = useMemo(() => {
    const total = state.organizations.length;
    const active = state.organizations.filter((org) => org.status === "active").length;
    const orderAmountCent = state.organizations.reduce((sum, org) => sum + org.orderAmountCent, 0);
    const creditBalance = state.organizations.reduce((sum, org) => sum + org.creditBalance, 0);
    return { total, active, orderAmountCent, creditBalance };
  }, [state.organizations]);

  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return state.organizations.filter((org) => {
      if (!keyword) return true;
      return [org.name, org.contractNo ?? "", org.adminNickname ?? "", org.id]
        .some((value) => value.toLowerCase().includes(keyword));
    });
  }, [query, state.organizations]);

  return (
    <div className="space-y-5">
      <SectionTitle
        title="企业管理"
        description="企业客户配置、专属折扣与企业订单开单，全程写入审计日志"
        action={
          <button type="button" onClick={() => setEditing("new")} className={ADMIN_PRIMARY_BUTTON}>
            <PlusIcon className="size-3.5" />新建企业
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile icon={<BuildingIcon className="size-3.5" />} label="企业总数" value={stats.total.toLocaleString()} hint={`正常 ${stats.active} 家`} />
        <StatTile icon={<CoinsIcon className="size-3.5" />} label="企业订单累计实收" value={`¥${centToYuan(stats.orderAmountCent)}`} />
        <StatTile icon={<CoinsIcon className="size-3.5" />} label="企业积分余额合计" value={`${stats.creditBalance.toLocaleString()} PT`} />
        <StatTile icon={<UserIcon className="size-3.5" />} label="企业成员席位" value={state.organizations.reduce((sum, org) => sum + org.seats, 0).toLocaleString()} />
      </div>
      <AdminCard className="p-3 sm:p-4">
        <label className="relative w-full sm:max-w-[360px]">
          <span className="sr-only">搜索企业</span>
          <SearchIcon className="pointer-events-none absolute left-3 top-3 size-4 text-white/30" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="企业名称 / 合同号 / 管理员"
            className={cn(ADMIN_INPUT, "pl-9")}
          />
        </label>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="border-b border-white/[0.07] bg-white/[0.02] text-[11px] text-white/35">
              <tr>
                <Th>企业 / 合同号</Th>
                <Th>管理员</Th>
                <Th>成员 / 席位</Th>
                <Th>折扣</Th>
                <Th>企业积分余额</Th>
                <Th>订单累计</Th>
                <Th>状态</Th>
                <Th>到期时间</Th>
                <Th><span className="sr-only">操作</span></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((org) => (
                <tr key={org.id} className="text-[12px] text-white/65 transition-colors hover:bg-white/[0.025]">
                  <Td>
                    <span className="block font-medium text-white">{org.name}</span>
                    <span className="mt-0.5 block text-[10px] text-white/35">{org.contractNo ?? "未登记合同号"}</span>
                  </Td>
                  <Td>
                    <span className="block text-white/80">{org.adminNickname ?? "未指定"}</span>
                    <span className="mt-0.5 block text-[10px] text-white/30">{org.adminUserId ?? "—"}</span>
                  </Td>
                  <Td>{org.memberCount} / {org.seats}</Td>
                  <Td>{org.discountPct > 0 ? <AdminBadge tone="brand">{discountLabel(org.discountPct)}</AdminBadge> : <span className="text-white/35">无折扣</span>}</Td>
                  <Td><span className="font-mono text-brand">{org.creditBalance.toLocaleString()} PT</span></Td>
                  <Td><span className="font-mono">¥{centToYuan(org.orderAmountCent)}</span><span className="mt-0.5 block text-[10px] text-white/35">{org.orderCount} 笔</span></Td>
                  <Td><StatusBadge status={org.status} /></Td>
                  <Td>{org.expiresAt ?? "长期有效"}</Td>
                  <Td>
                    <div className="flex gap-1.5">
                      <button type="button" onClick={() => setEditing(org)} className={ADMIN_SECONDARY_BUTTON}><EditIcon className="size-3.5" />编辑配置</button>
                      <button type="button" onClick={() => setMembersOrg(org)} className={ADMIN_SECONDARY_BUTTON}><UsersIcon className="size-3.5" />成员管理</button>
                      <button type="button" onClick={() => setOrderOrg(org)} className={ADMIN_PRIMARY_BUTTON}><CoinsIcon className="size-3.5" />创建订单</button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <EmptyState text="没有匹配的企业" /> : null}
      </AdminCard>

      {editing !== null ? (
        <OrgEditor
          key={editing === "new" ? "new" : editing.id}
          target={editing}
          state={state}
          onClose={() => setEditing(null)}
          onSaved={(name, created) => {
            setEditing(null);
            toast({ title: created ? "企业已创建" : "企业配置已保存", description: `${name} 的配置变更已记录审计。`, tone: "success" });
          }}
          onError={(message) => toast({ title: "保存失败", description: message, tone: "error" })}
        />
      ) : null}

      {orderOrg !== null ? (
        <EnterpriseOrderModal
          key={orderOrg.id}
          org={orderOrg}
          creditsPerYuan={state.creditPolicy.creditsPerYuan}
          onClose={() => setOrderOrg(null)}
          onCreated={(orderId, amountCent) => {
            setOrderOrg(null);
            toast({ title: "企业订单已创建", description: `订单 ${orderId}，实收 ¥${centToYuan(amountCent)}，积分已发放并记录审计。`, tone: "success" });
          }}
          onError={(message) => toast({ title: "创建订单失败", description: message, tone: "error" })}
        />
      ) : null}

      {membersOrg !== null ? (
        <MembersModal
          key={membersOrg.id}
          org={membersOrg}
          onClose={() => setMembersOrg(null)}
          onToast={(input) => toast(input)}
        />
      ) : null}
    </div>
  );
}

/** 企业配置编辑弹框：新建与编辑复用；编辑时额外提供状态变更。 */
function OrgEditor({
  target,
  state,
  onClose,
  onSaved,
  onError,
}: {
  target: AdminOrganization | "new";
  state: AdminState;
  onClose: () => void;
  onSaved: (name: string, created: boolean) => void;
  onError: (message: string) => void;
}) {
  const isNew = target === "new";
  const org = isNew ? null : target;
  const [name, setName] = useState(org?.name ?? "");
  const [contractNo, setContractNo] = useState(org?.contractNo ?? "");
  const [adminUserId, setAdminUserId] = useState(org?.adminUserId ?? "");
  const [seats, setSeats] = useState(String(org?.seats ?? 20));
  const [maxConcurrency, setMaxConcurrency] = useState(String(org?.maxConcurrency ?? 20));
  const [monthlyComputeQuota, setMonthlyComputeQuota] = useState(String(org?.monthlyComputeQuota ?? 1_000_000));
  const [discountPct, setDiscountPct] = useState(String(org?.discountPct ?? 0));
  const [expiresAt, setExpiresAt] = useState(org?.expiresAt ?? "");
  const [status, setStatus] = useState<AdminOrganization["status"]>(org?.status ?? "active");
  const [saving, setSaving] = useState(false);
  /** 编辑态主账号下拉选项：该企业现有成员列表 */
  const [memberOptions, setMemberOptions] = useState<AdminOrganizationMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // 编辑态拉取成员列表作为主账号下拉选项；失败时仅保留代管选项，由服务端校验兜底
  useEffect(() => {
    if (isNew || !org) return;
    let cancelled = false;
    setMembersLoading(true);
    fetchAdminOrganizationMembers(org.id)
      .then((result) => {
        if (!cancelled) setMemberOptions(result.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, org]);

  /** 历史遗留：现任主账号不在成员列表中（非成员），保留选项并提示更换 */
  const legacyAdmin =
    !isNew && adminUserId !== "" && !memberOptions.some((member) => member.id === adminUserId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 1) {
      onError("请填写企业名称");
      return;
    }
    const payload = {
      name: name.trim(),
      contractNo: contractNo.trim() || null,
      adminUserId: adminUserId.trim() || null,
      seats: Number(seats),
      maxConcurrency: Number(maxConcurrency),
      monthlyComputeQuota: Number(monthlyComputeQuota),
      discountPct: Number(discountPct),
      expiresAt: expiresAt || null,
    };
    if (!Number.isInteger(payload.seats) || payload.seats < 1 || payload.seats > 10_000) {
      onError("席位数必须为 1-10000 的整数");
      return;
    }
    if (!Number.isInteger(payload.maxConcurrency) || payload.maxConcurrency < 1 || payload.maxConcurrency > 10_000) {
      onError("并发上限必须为 1-10000 的整数");
      return;
    }
    if (!Number.isInteger(payload.monthlyComputeQuota) || payload.monthlyComputeQuota < 0) {
      onError("月算力额度必须为非负整数");
      return;
    }
    if (!Number.isInteger(payload.discountPct) || payload.discountPct < 0 || payload.discountPct > 90) {
      onError("折扣减免百分比必须为 0-90 的整数");
      return;
    }
    setSaving(true);
    try {
      await saveAdminOrganization(
        isNew ? payload : { ...payload, status },
        org?.id,
      );
      onSaved(payload.name, isNew);
    } catch (error) {
      onError(error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isNew ? "新建企业" : "编辑企业配置"} className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[620px] overflow-y-auto p-5 sm:p-6">
      <form onSubmit={handleSubmit}>
        <h2 className="text-[18px] font-semibold text-white">{isNew ? "新建企业客户" : `编辑 ${org?.name ?? ""}`}</h2>
        <p className="mt-1 text-[12px] text-white/40">折扣按积分价值减免（如 30 即七折），企业订单开单时自动套用。</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="企业名称（必填）"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：星芒文化传播有限公司" className={ADMIN_INPUT} /></Field>
          <Field label="合同号"><input value={contractNo} onChange={(event) => setContractNo(event.target.value)} placeholder="例如：BL-2026-001" className={ADMIN_INPUT} /></Field>
          {isNew ? (
            <Field label="主账号用户 ID（可留空代管）">
              <input value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)} placeholder="留空则由当前操作人代管" className={ADMIN_INPUT} />
            </Field>
          ) : (
            <Field label={membersLoading ? "主账号（成员加载中…）" : "主账号（从企业成员中选择）"}>
              <select value={adminUserId} onChange={(event) => setAdminUserId(event.target.value)} className={ADMIN_INPUT}>
                <option value="">暂由操作人代管（不指定主账号）</option>
                {legacyAdmin ? <option value={adminUserId}>现任主账号（非成员，建议更换）</option> : null}
                {memberOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nickname}（{member.id}）{member.isAdmin ? " · 现任主账号" : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="席位数（1-10000）"><input type="number" min="1" step="1" value={seats} onChange={(event) => setSeats(event.target.value)} className={ADMIN_INPUT} /></Field>
          <Field label="并发上限（1-10000）"><input type="number" min="1" step="1" value={maxConcurrency} onChange={(event) => setMaxConcurrency(event.target.value)} className={ADMIN_INPUT} /></Field>
          <Field label="月算力额度"><input type="number" min="0" step="1" value={monthlyComputeQuota} onChange={(event) => setMonthlyComputeQuota(event.target.value)} className={ADMIN_INPUT} /></Field>
          <Field label={`折扣减免百分比（0-90，当前 ${discountLabel(Number(discountPct) || 0)}）`}><input type="number" min="0" max="90" step="1" value={discountPct} onChange={(event) => setDiscountPct(event.target.value)} className={ADMIN_INPUT} /></Field>
          <Field label="到期时间"><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className={ADMIN_INPUT} /></Field>
          {!isNew ? (
            <Field label="企业状态">
              <select value={status} onChange={(event) => setStatus(event.target.value as AdminOrganization["status"])} className={ADMIN_INPUT}>
                <option value="active">正常</option>
                <option value="suspended">暂停</option>
                <option value="closed">关闭</option>
              </select>
            </Field>
          ) : null}
          {isNew && adminUserId.trim() && !state.users.some((user) => user.id === adminUserId.trim()) ? (
            <p className="sm:col-span-2 text-[11px] text-warning">提示：用户列表中未找到该管理员 ID，保存前请确认 ID 正确。</p>
          ) : null}
          {!isNew && memberOptions.length === 0 && !membersLoading ? (
            <p className="sm:col-span-2 text-[11px] text-warning">提示：该企业暂无成员，主账号仅可选择代管；请先在「成员管理」中添加成员。</p>
          ) : null}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ADMIN_SECONDARY_BUTTON}>取消</button>
          <button type="submit" disabled={saving} className={ADMIN_PRIMARY_BUTTON}>{saving ? "保存中…" : isNew ? "创建企业" : "保存配置"}</button>
        </div>
      </form>
    </Modal>
  );
}

/** 企业订单创建弹框：输入积分数量，实时预览原价 / 折后价（与服务端同公式）。 */
function EnterpriseOrderModal({
  org,
  creditsPerYuan,
  onClose,
  onCreated,
  onError,
}: {
  org: AdminOrganization;
  creditsPerYuan: number;
  onClose: () => void;
  onCreated: (orderId: string, amountCent: number) => void;
  onError: (message: string) => void;
}) {
  const [credits, setCredits] = useState("10000");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => {
    const value = Number(credits);
    if (!Number.isInteger(value) || value < 1 || value > 100_000_000) return null;
    try {
      return computeEnterpriseOrderPricing(value, creditsPerYuan, org.discountPct);
    } catch {
      return null;
    }
  }, [credits, creditsPerYuan, org.discountPct]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(credits);
    if (!Number.isInteger(value) || value < 1 || value > 100_000_000) {
      onError("发放积分必须为 1-100000000 的正整数");
      return;
    }
    if (reason.trim().length < 2) {
      onError("请填写创建原因（写入审计日志）");
      return;
    }
    setSubmitting(true);
    try {
      const result = await createAdminEnterpriseOrder(org.id, value, reason.trim());
      onCreated(result.orderId, result.amountCent);
    } catch (error) {
      onError(error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="创建企业订单" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[560px] overflow-y-auto p-5 sm:p-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3 pr-8">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><BuildingIcon className="size-5" /></span>
          <span>
            <h2 className="text-[18px] font-semibold text-white">{org.name}</h2>
            <p className="mt-1 text-[11px] text-white/40">{org.contractNo ?? "未登记合同号"} · 企业折扣 <span className="text-brand">{discountLabel(org.discountPct)}</span> · 当前余额 {org.creditBalance.toLocaleString()} PT</p>
          </span>
        </div>
        <div className="mt-5 grid gap-4">
          <Field label="发放积分数量（正整数）"><input type="number" min="1" step="1" value={credits} onChange={(event) => setCredits(event.target.value)} className={ADMIN_INPUT} /></Field>
          <div className="rounded-xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
            <p className="text-[11px] text-white/40">金额预览（积分汇率 {creditsPerYuan.toLocaleString()} PT/元，整数分计价）</p>
            <div className="mt-2 flex items-baseline gap-3">
              {preview ? (
                <>
                  <span className="font-mono text-[13px] text-white/40 line-through">¥{centToYuan(preview.originalCent)}</span>
                  <span className="font-mono text-[22px] font-bold text-brand">¥{centToYuan(preview.amountCent)}</span>
                  {org.discountPct > 0 ? <AdminBadge tone="brand">{discountLabel(org.discountPct)}</AdminBadge> : null}
                </>
              ) : (
                <span className="text-[12px] text-warning">请输入有效的积分数量后查看价格</span>
              )}
            </div>
          </div>
          <Field label="创建原因（必填，写入审计日志）"><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：企业合同 Q4 增补积分到账" className={cn(ADMIN_INPUT, "h-24 resize-none py-3")} /></Field>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-white/35">提交后立即创建已支付企业订单（对公转账渠道），并向企业管理员账户发放企业积分。</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ADMIN_SECONDARY_BUTTON}>取消</button>
          <button type="submit" disabled={submitting} className={ADMIN_PRIMARY_BUTTON}>{submitting ? "创建中…" : "创建订单"}</button>
        </div>
      </form>
    </Modal>
  );
}

const USER_STATUS = { active: "正常", risk: "风险", disabled: "停用" } as const;

/** 企业成员管理弹框：查看成员、更换主账号、移除成员、搜索用户加入企业。 */
function MembersModal({
  org,
  onClose,
  onToast,
}: {
  org: AdminOrganization;
  onClose: () => void;
  onToast: (input: { title: string; description?: string; tone?: "success" | "error" | "info" }) => void;
}) {
  const [data, setData] = useState<AdminOrganizationMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** 任一成员操作进行中：禁用全部操作按钮，避免并发变更 */
  const [mutating, setMutating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUser[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await fetchAdminOrganizationMembers(org.id));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [org.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 用户搜索防抖 300ms：至少 1 个字符才触发；换词时清空已选中用户
  useEffect(() => {
    const keyword = searchQuery.trim();
    setSelectedUser(null);
    if (!keyword) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      searchAdminUsers(keyword)
        .then((result) => setSearchResults(result.items))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const seatsFull = data !== null && data.memberCount >= data.seats;

  const handleSetAdmin = async (member: AdminOrganizationMember) => {
    if (!window.confirm(`确认将「${member.nickname}（${member.id}）」设为该企业主账号？`)) return;
    setMutating(true);
    try {
      await changeAdminOrganizationAdmin(org.id, member.id);
      onToast({ title: "主账号已更换", description: `新主账号：${member.nickname}（${member.id}），变更已记录审计。`, tone: "success" });
      await reload();
    } catch (error) {
      onToast({ title: "更换主账号失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    } finally {
      setMutating(false);
    }
  };

  const handleRemove = async (member: AdminOrganizationMember) => {
    if (!window.confirm(`确认将「${member.nickname}（${member.id}）」移出企业？移除后该用户将失去企业归属。`)) return;
    setMutating(true);
    try {
      await removeAdminOrganizationMember(org.id, member.id);
      onToast({ title: "成员已移除", description: `${member.nickname}（${member.id}）已移出 ${org.name}，操作已记录审计。`, tone: "success" });
      await reload();
    } catch (error) {
      onToast({ title: "移除成员失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    } finally {
      setMutating(false);
    }
  };

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedUser === null) {
      onToast({ title: "请先选择用户", description: "搜索并从结果中选择要加入企业的用户。", tone: "error" });
      return;
    }
    if (reason.trim().length < 2) {
      onToast({ title: "请填写添加原因", description: "添加原因将写入审计日志（至少 2 字）。", tone: "error" });
      return;
    }
    setMutating(true);
    try {
      await addAdminOrganizationMember(org.id, selectedUser.id, reason.trim());
      onToast({ title: "成员已加入", description: `${selectedUser.nickname}（${selectedUser.id}）已加入 ${org.name}，操作已记录审计。`, tone: "success" });
      setSearchQuery("");
      setReason("");
      await reload();
    } catch (error) {
      onToast({ title: "添加成员失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    } finally {
      setMutating(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="成员管理" className="max-h-[90vh] w-[calc(100vw-24px)] max-w-[760px] overflow-y-auto p-5 sm:p-6">
      <div className="flex items-start gap-3 pr-8">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand"><BuildingIcon className="size-5" /></span>
        <span className="min-w-0">
          <h2 className="text-[18px] font-semibold text-white">{org.name}</h2>
          <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/40">
            {data?.adminUserId ? (
              <>
                <CrownIcon className="size-3.5 text-brand" />
                <span className="text-white/60">主账号：{data.adminNickname ?? "—"}（{data.adminUserId}）</span>
                <AdminBadge tone="brand">主账号</AdminBadge>
              </>
            ) : (
              <span className="text-warning">未指定主账号（暂由操作人代管）</span>
            )}
          </p>
        </span>
      </div>

      {loading ? (
        <p className="mt-6 text-[12px] text-white/40">成员加载中…</p>
      ) : loadError !== null ? (
        <div className="mt-6">
          <p className="text-[12px] text-danger">{loadError}</p>
          <button type="button" onClick={() => void reload()} className={cn(ADMIN_SECONDARY_BUTTON, "mt-3")}>重新加载</button>
        </div>
      ) : data === null || data.items.length === 0 ? (
        <div className="mt-6"><EmptyState text="该企业暂无成员" /></div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl ring-1 ring-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-[11px] text-white/40">
            <span>成员 {data.memberCount} / 席位 {data.seats}</span>
            {seatsFull ? <span className="text-warning">席位已满，无法继续添加成员</span> : null}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-white/[0.07] text-[11px] text-white/35">
                <tr>
                  <Th>成员</Th>
                  <Th>注册时间</Th>
                  <Th>状态</Th>
                  <Th><span className="sr-only">操作</span></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {data.items.map((member) => (
                  <tr key={member.id} className="text-[12px] text-white/65 transition-colors hover:bg-white/[0.025]">
                    <Td>
                      <span className="flex items-center gap-1.5 font-medium text-white">
                        {member.isAdmin ? <CrownIcon className="size-3.5 shrink-0 text-brand" /> : null}
                        {member.nickname}
                        {member.isAdmin ? <AdminBadge tone="brand">主账号</AdminBadge> : null}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-white/35">{member.id} · {member.contact}</span>
                    </Td>
                    <Td>{member.registeredAt}</Td>
                    <Td><UserStatusBadge status={member.status} /></Td>
                    <Td>
                      {member.isAdmin ? (
                        <span className="text-[11px] text-white/30" title="主账号不可移除，请先更换企业主账号">主账号不可移除</span>
                      ) : (
                        <div className="flex gap-1.5">
                          <button type="button" disabled={mutating} onClick={() => void handleSetAdmin(member)} className={ADMIN_SECONDARY_BUTTON} title="设为该企业主账号">设为主账号</button>
                          <button type="button" disabled={mutating} onClick={() => void handleRemove(member)} className={ADMIN_SECONDARY_BUTTON} title="移出该企业"><TrashIcon className="size-3.5" />移除</button>
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <form onSubmit={handleAdd} className="mt-6 rounded-xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
        <p className="text-[12px] font-medium text-white">添加成员</p>
        <p className="mt-1 text-[11px] text-white/40">按手机号 / 邮箱 / 用户 ID / 昵称搜索后台用户，选择后加入该企业。</p>
        <div className="mt-3 grid gap-3">
          <label>
            <span className={ADMIN_LABEL}>搜索用户</span>
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="输入手机号 / 邮箱 / 用户 ID / 昵称" className={ADMIN_INPUT} disabled={seatsFull} />
          </label>
          {searching ? <p className="text-[11px] text-white/40">搜索中…</p> : null}
          {searchResults !== null ? (
            searchResults.length === 0 ? (
              <p className="text-[11px] text-white/40">没有匹配的用户</p>
            ) : (
              <ul className="max-h-[168px] divide-y divide-white/[0.06] overflow-y-auto rounded-xl ring-1 ring-white/[0.07]" role="listbox" aria-label="用户搜索结果">
                {searchResults.map((user) => {
                  const taken = user.organization !== null;
                  const active = selectedUser?.id === user.id;
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        disabled={taken || seatsFull}
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors",
                          taken || seatsFull ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.04]",
                          active ? "bg-brand/10" : "",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-medium text-white">{user.nickname}（{user.id}）</span>
                          <span className="mt-0.5 block text-[10px] text-white/40">{user.contact}</span>
                        </span>
                        <span className="shrink-0 text-[10px]">
                          {taken ? <span className="text-white/35">已归属 {user.organization}</span> : active ? <span className="text-brand">已选择</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : null}
          <label>
            <span className={ADMIN_LABEL}>添加原因（必填，写入审计日志）</span>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：企业合同增补席位，拉入新成员" className={cn(ADMIN_INPUT, "h-20 resize-none py-3")} disabled={seatsFull} />
          </label>
          {seatsFull ? (
            <p className="text-[11px] text-warning">席位已满（{data?.memberCount ?? 0}/{data?.seats ?? org.seats}），请先在「编辑配置」中扩充席位或移除成员。</p>
          ) : null}
          <div className="flex items-center justify-end">
            <button type="submit" disabled={mutating || seatsFull || selectedUser === null} className={ADMIN_PRIMARY_BUTTON}>{mutating ? "提交中…" : "确认加入"}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function StatusBadge({ status }: { status: AdminOrganization["status"] }) {
  return <AdminBadge tone={status === "active" ? "success" : status === "suspended" ? "warning" : "danger"}>{ORG_STATUS[status]}</AdminBadge>;
}

function UserStatusBadge({ status }: { status: AdminOrganizationMember["status"] }) {
  return <AdminBadge tone={status === "active" ? "success" : status === "risk" ? "warning" : "danger"}>{USER_STATUS[status]}</AdminBadge>;
}
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={ADMIN_LABEL}>{label}</span>{children}</label>; }

function StatTile({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
      <span className="flex items-center gap-1.5 text-[11px] text-white/40">{icon}{label}</span>
      <span className="mt-2 block font-mono text-[22px] font-semibold tracking-[-0.02em] text-white">{value}</span>
      {hint ? <span className="mt-1 block text-[10px] text-white/30">{hint}</span> : null}
    </div>
  );
}
