import { expect, test } from "@playwright/test";

test("merged navigation retains campaigns and membership while anonymous", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("button", { name: "登录", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "订阅会员", exact: true })).toBeVisible();
  await expect(page.locator('a[href="/campaigns/campus-ai"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: "企业管理后台" })).toHaveCount(0);
});

test("guard, verified login, persistence and logout share one session", async ({ page }) => {
  await page.goto("/project");
  await expect(page).toHaveURL(/\/home\?login=1&next=/);
  const dialog = page.getByRole("dialog", { name: "登录", exact: true });
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("请输入手机号").fill("13800138000");
  await dialog.getByPlaceholder("6 位验证码").fill("888888");
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "登录", exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/home/);
  await dialog.getByPlaceholder("6 位验证码").fill("123456");
  await dialog.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page).toHaveURL(/\/project$/);
  await expect(dialog).not.toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "个人中心", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "企业管理后台" })).toBeVisible();
  await page.getByRole("button", { name: "个人中心", exact: true }).click();
  await page.getByRole("dialog", { name: "账户菜单" }).getByRole("button", { name: "退出登录", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("button", { name: "登录", exact: true })).toBeVisible();
  await page.goto("/project");
  await expect(page.getByRole("dialog", { name: "登录", exact: true })).toBeVisible();
});

test("admin APIs reject anonymous requests", async ({ request }) => {
  const response = await request.get("/api/admin/dashboard");
  expect(response.status()).toBe(401);
});
