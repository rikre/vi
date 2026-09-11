import { expect, test } from "@playwright/test";

test("admin unavailable state retains navigation and safe recovery", async ({ page }) => {
  await page.route("**/api/admin/**", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { code: "DATABASE_UNAVAILABLE", message: "测试环境数据库未配置" } }) }));
  await page.goto("/admin");
  const login = page.getByRole("dialog", { name: "登录", exact: true });
  await login.getByPlaceholder("请输入手机号").fill("13800138000");
  await login.getByPlaceholder("6 位验证码").fill("123456");
  await login.getByRole("checkbox").check();
  await login.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("heading", { name: "数据加载失败" })).toBeVisible();
  await page.getByRole("button", { name: "套餐权益", exact: true }).click();
  await expect(page.getByText(/当前模块：套餐权益/)).toBeVisible();
  await expect(page.getByRole("button", { name: "新建套餐" })).toHaveCount(0);
  await expect(page.getByRole("list", { name: "后台恢复步骤" })).toBeVisible();
  await page.getByRole("button", { name: "重新加载", exact: true }).click();
  await expect(page.getByRole("heading", { name: "数据加载失败" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "/tmp/bollo-admin-recovery.png" });
});
