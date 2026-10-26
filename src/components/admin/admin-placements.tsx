"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AdminBadge,
  AdminCard,
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_PRIMARY_BUTTON,
  ADMIN_SECONDARY_BUTTON,
  EmptyState,
  SectionTitle,
  Toggle,
} from "@/components/admin/admin-ui";
import { EditIcon, ImageIcon, PlusIcon, SparkleIcon, TrashIcon } from "@/components/icons";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { deleteAdminPlacementItem, saveAdminPlacementItem, updateAdminPlacement } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import type { AdminPlacement, AdminPlacementItem, AdminState } from "@/types/admin";

const TYPE_LABEL = { carousel: "轮播", single: "单图", list: "列表" } as const;

type ItemFormState = {
  title: string;
  subtitle: string;
  imageUrl: string;
  iconKey: string;
  linkUrl: string;
  badge: string;
  sortOrder: string;
  status: AdminPlacementItem["status"];
  startAt: string;
  endAt: string;
};

const EMPTY_FORM: ItemFormState = {
  title: "",
  subtitle: "",
  imageUrl: "",
  iconKey: "",
  linkUrl: "",
  badge: "",
  sortOrder: "0",
  status: "active",
  startAt: "",
  endAt: "",
};

/** ISO 时间转 datetime-local 输入值（本地时区，保证读写往返一致）。 */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** datetime-local 输入值转 ISO；空值返回 null。 */
function localInputToIso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** 表格展示用的短时间格式（MM-DD HH:mm）。 */
function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 依据定时窗口推导展示徽章：待生效 / 生效中 / 已结束；无窗口返回 null。 */
function scheduleBadge(item: AdminPlacementItem): { label: string; tone: "success" | "warning" | "neutral" } | null {
  if (!item.startAt && !item.endAt) return null;
  const now = Date.now();
  if (item.startAt && new Date(item.startAt).getTime() > now) return { label: "待生效", tone: "warning" };
  if (item.endAt && new Date(item.endAt).getTime() < now) return { label: "已结束", tone: "neutral" };
  return { label: "生效中", tone: "success" };
}

export function AdminPlacements({ state }: { state: AdminState }) {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(state.placements[0]?.id ?? "");
  const [editing, setEditing] = useState<{ placementId: string; item: AdminPlacementItem | null } | null>(null);
  const [form, setForm] = useState<ItemFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<AdminPlacementItem | null>(null);

  const active = state.placements.find((placement) => placement.id === activeId) ?? state.placements[0] ?? null;

  const stats = useMemo(() => {
    const enabled = state.placements.filter((placement) => placement.enabled).length;
    const items = state.placements.reduce((sum, placement) => sum + placement.items.length, 0);
    const online = state.placements.reduce(
      (sum, placement) => sum + placement.items.filter((item) => item.status === "active").length,
      0,
    );
    return { total: state.placements.length, enabled, items, online };
  }, [state.placements]);

  const openCreate = () => {
    if (!active) return;
    setEditing({ placementId: active.id, item: null });
    setForm({ ...EMPTY_FORM, sortOrder: String(active.items.length) });
  };

  const openEdit = (item: AdminPlacementItem) => {
    if (!active) return;
    setEditing({ placementId: active.id, item });
    setForm({
      title: item.title,
      subtitle: item.subtitle ?? "",
      imageUrl: item.imageUrl ?? "",
      iconKey: item.iconKey ?? "",
      linkUrl: item.linkUrl ?? "",
      badge: item.badge ?? "",
      sortOrder: String(item.sortOrder),
      status: item.status,
      startAt: isoToLocalInput(item.startAt),
      endAt: isoToLocalInput(item.endAt),
    });
  };

  const togglePlacement = async (placement: AdminPlacement, enabled: boolean) => {
    try {
      await updateAdminPlacement(placement.id, { enabled });
      toast({
        title: enabled ? "运营位已启用" : "运营位已停用",
        description: `${placement.name}：前台将${enabled ? "展示数据库配置内容" : "回退静态默认内容"}。`,
        tone: "success",
      });
    } catch (error) {
      toast({ title: "启停失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    if (!form.title.trim()) {
      toast({ title: "请填写素材标题", tone: "error" });
      return;
    }
    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9_999) {
      toast({ title: "排序值不合法", description: "请输入 0–9999 的整数。", tone: "error" });
      return;
    }
    const startAt = localInputToIso(form.startAt);
    const endAt = localInputToIso(form.endAt);
    if (startAt && endAt && endAt <= startAt) {
      toast({ title: "时间窗口不合法", description: "结束时间必须晚于开始时间。", tone: "error" });
      return;
    }
    setSaving(true);
    try {
      await saveAdminPlacementItem(
        editing.placementId,
        {
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          iconKey: form.iconKey.trim() || null,
          linkUrl: form.linkUrl.trim() || null,
          badge: form.badge.trim() || null,
          sortOrder,
          status: form.status,
          startAt,
          endAt,
        },
        editing.item?.id,
      );
      toast({
        title: editing.item ? "素材已更新" : "素材已新增",
        description: `${form.title.trim()} 已保存并记录审计。`,
        tone: "success",
      });
      setEditing(null);
    } catch (error) {
      toast({ title: "保存失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!removing) return;
    try {
      await deleteAdminPlacementItem(removing.id);
      toast({ title: "素材已删除", description: `${removing.title} 已从运营位移除。`, tone: "success" });
      setRemoving(null);
    } catch (error) {
      toast({ title: "删除失败", description: error instanceof Error ? error.message : "请稍后重试", tone: "error" });
    }
  };

  return (
    <div className="space-y-5">
      <SectionTitle title="运营位配置" description="首页轮播、横幅与各内容分区的素材管理，支持排序、上下架与定时生效" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="运营位总数" value={String(stats.total)} />
        <StatTile label="启用中的位" value={`${stats.enabled}/${stats.total}`} />
        <StatTile label="素材总数" value={String(stats.items)} />
        <StatTile label="上线素材" value={String(stats.online)} />
      </div>

      {state.placements.length === 0 ? (
        <AdminCard><EmptyState text="暂无运营位数据，请先运行数据库 seed。" /></AdminCard>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[248px_1fr]">
          <AdminCard className="p-2">
            <ul className="space-y-1" aria-label="运营位列表">
              {state.placements.map((placement) => (
                <li key={placement.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(placement.id)}
                    aria-current={active?.id === placement.id ? "true" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1.5 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active?.id === placement.id ? "bg-brand/12 ring-1 ring-brand/25" : "hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className={cn("truncate text-[13px] font-medium", active?.id === placement.id ? "text-brand" : "text-white/75")}>{placement.name}</span>
                      <span className={cn("size-1.5 shrink-0 rounded-full", placement.enabled ? "bg-success" : "bg-white/25")} />
                    </span>
                    <span className="flex items-center gap-2 text-[10px] text-white/35">
                      <span>{TYPE_LABEL[placement.type] ?? "列表"}</span>
                      <span>·</span>
                      <span>{placement.items.length} 条素材</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </AdminCard>

          {active ? (
            <AdminCard className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-white">{active.name}</h3>
                      <AdminBadge tone={active.enabled ? "success" : "neutral"}>{active.enabled ? "启用" : "停用"}</AdminBadge>
                      <AdminBadge>{TYPE_LABEL[active.type] ?? "列表"}</AdminBadge>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-white/30">{active.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-2 text-[11px] text-white/45">
                    <Toggle checked={active.enabled} onChange={(checked) => void togglePlacement(active, checked)} label={`${active.name} 启停`} />
                    整位启停
                  </span>
                  <button type="button" onClick={openCreate} className={ADMIN_PRIMARY_BUTTON}>
                    <PlusIcon className="size-3.5" />新增素材
                  </button>
                </div>
              </div>

              {active.items.length === 0 ? (
                <EmptyState text="该运营位暂无素材，点击「新增素材」配置第一条内容。" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="text-[11px] text-white/40">
                      <tr className="border-b border-white/[0.06]">
                        <Th>排序</Th>
                        <Th>标题</Th>
                        <Th>图片</Th>
                        <Th>链接</Th>
                        <Th>生效时段</Th>
                        <Th>状态</Th>
                        <Th>操作</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {active.items.map((item) => {
                        const schedule = scheduleBadge(item);
                        return (
                          <tr key={item.id} className="text-white/70 transition-colors hover:bg-white/[0.02]">
                            <Td><span className="font-mono text-white/50">{item.sortOrder}</span></Td>
                            <Td>
                              <div className="flex min-w-0 flex-col">
                                <span className="max-w-[220px] truncate font-medium text-white/85">{item.title}</span>
                                {item.subtitle ? <span className="max-w-[220px] truncate text-[11px] text-white/35">{item.subtitle}</span> : null}
                              </div>
                            </Td>
                            <Td>
                              {item.imageUrl ? (
                                // 动态图片必须懒加载，避免阻塞后台首屏渲染
                                <img src={item.imageUrl} alt={item.title} loading="lazy" className="size-9 rounded-lg object-cover ring-1 ring-white/10" />
                              ) : (
                                <span className="flex size-9 items-center justify-center rounded-lg bg-white/[0.05] text-white/25"><ImageIcon className="size-4" /></span>
                              )}
                            </Td>
                            <Td>
                              {item.linkUrl ? (
                                <a href={item.linkUrl} target="_blank" rel="noreferrer" className="max-w-[160px] truncate text-info underline-offset-2 hover:underline">{item.linkUrl}</a>
                              ) : (
                                <span className="text-white/25">—</span>
                              )}
                            </Td>
                            <Td>
                              {item.startAt || item.endAt ? (
                                <span className="font-mono text-[11px] text-white/50">
                                  {item.startAt ? formatTime(item.startAt) : "起"} ~ {item.endAt ? formatTime(item.endAt) : "止"}
                                </span>
                              ) : (
                                <span className="text-white/25">长期</span>
                              )}
                            </Td>
                            <Td>
                              {item.status === "hidden" ? (
                                <AdminBadge>已下线</AdminBadge>
                              ) : schedule ? (
                                <AdminBadge tone={schedule.tone}>{schedule.label}</AdminBadge>
                              ) : (
                                <AdminBadge tone="success">在线</AdminBadge>
                              )}
                            </Td>
                            <Td>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => openEdit(item)} aria-label={`编辑 ${item.title}`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white">
                                  <EditIcon className="size-3.5" />
                                </button>
                                <button type="button" onClick={() => setRemoving(item)} aria-label={`删除 ${item.title}`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-danger/10 hover:text-danger">
                                  <TrashIcon className="size-3.5" />
                                </button>
                              </div>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {active.items.length > 0 ? (
                <p className="border-t border-white/[0.06] px-4 py-3 text-[11px] leading-5 text-white/35">
                  排序值越小越靠前；定时窗口外的素材前台自动隐藏；整位停用后首页回退静态默认内容。
                </p>
              ) : null}
            </AdminCard>
          ) : null}
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title="素材编辑" className="w-[min(560px,calc(100vw-32px))] p-6">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <h3 className="text-[16px] font-semibold text-white">{editing?.item ? "编辑素材" : "新增素材"}</h3>
            <p className="mt-1 text-[12px] text-white/40">{state.placements.find((placement) => placement.id === editing?.placementId)?.name ?? ""}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="标题（必填）">
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={80} required className={ADMIN_INPUT} placeholder="素材标题" />
            </Field>
            <Field label="副标题">
              <input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} maxLength={200} className={ADMIN_INPUT} placeholder="可选" />
            </Field>
            <Field label="图片地址">
              <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className={ADMIN_INPUT} placeholder="/images/… 或 https://…" />
            </Field>
            <Field label="图标标识">
              <input value={form.iconKey} onChange={(event) => setForm({ ...form, iconKey: event.target.value })} maxLength={64} className={ADMIN_INPUT} placeholder="可选，如 sparkles" />
            </Field>
            <Field label="跳转链接">
              <input value={form.linkUrl} onChange={(event) => setForm({ ...form, linkUrl: event.target.value })} className={ADMIN_INPUT} placeholder="/library 或 https://…" />
            </Field>
            <Field label="角标文案">
              <input value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} maxLength={200} className={ADMIN_INPUT} placeholder="可选，如 HOT" />
            </Field>
            <Field label="排序值（0–9999）">
              <input type="number" min={0} max={9999} step={1} value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} className={ADMIN_INPUT} />
            </Field>
            <Field label="状态">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminPlacementItem["status"] })} className={ADMIN_INPUT}>
                <option value="active">上线</option>
                <option value="hidden">下线</option>
              </select>
            </Field>
            <Field label="开始生效时间">
              <input type="datetime-local" value={form.startAt} onChange={(event) => setForm({ ...form, startAt: event.target.value })} className={cn(ADMIN_INPUT, "[color-scheme:dark]")} />
            </Field>
            <Field label="结束生效时间">
              <input type="datetime-local" value={form.endAt} onChange={(event) => setForm({ ...form, endAt: event.target.value })} className={cn(ADMIN_INPUT, "[color-scheme:dark]")} />
            </Field>
          </div>
          <p className="text-[11px] leading-5 text-white/35">时间留空表示长期生效；两者都填写时结束时间必须晚于开始时间。保存后立即生效并记录审计日志。</p>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className={ADMIN_SECONDARY_BUTTON}>取消</button>
            <button type="submit" disabled={saving} className={ADMIN_PRIMARY_BUTTON}>{saving ? "保存中…" : editing?.item ? "保存修改" : "创建素材"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={removing !== null} onClose={() => setRemoving(null)} title="删除确认" className="w-[min(400px,calc(100vw-32px))] p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger"><TrashIcon className="size-4" /></span>
            <div>
              <h3 className="text-[15px] font-semibold text-white">删除素材</h3>
              <p className="mt-1.5 text-[12px] leading-5 text-white/45">确定删除「{removing?.title}」吗？删除后前台立即不再展示，操作将记录审计日志。</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className={ADMIN_SECONDARY_BUTTON}>取消</button>
            <button type="button" onClick={() => void handleDelete()} className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-danger px-4 text-[13px] font-semibold text-white transition-colors hover:opacity-90">确认删除</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td className="whitespace-nowrap px-4 py-3.5">{children}</td>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className={ADMIN_LABEL}>{label}</span>{children}</label>; }

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.07]">
      <span className="flex items-center gap-1.5 text-[11px] text-white/40"><SparkleIcon className="size-3.5" />{label}</span>
      <span className="mt-2 block font-mono text-[22px] font-semibold tracking-[-0.02em] text-white">{value}</span>
    </div>
  );
}
