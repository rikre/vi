import { test, expect } from "@playwright/test";

test.describe("项目列表页 /comic", () => {
  test("应渲染项目卡片列表", async ({ page }) => {
    await page.goto("/comic");
    await expect(page.getByRole("heading", { name: "我的项目" })).toBeVisible();
    const cards = page.getByRole("link").filter({ hasText: /集/ });
    await expect(cards.first()).toBeVisible();
  });

  test("搜索框应过滤项目", async ({ page }) => {
    await page.goto("/comic");
    const search = page.getByRole("searchbox", { name: "搜索项目" });
    await search.fill("小福星");
    const cards = page.getByRole("link").filter({ hasText: "小福星" });
    await expect(cards.first()).toBeVisible();
  });

  test("点击项目卡片应导航到工作台", async ({ page }) => {
    await page.goto("/comic");
    await page.getByRole("link").filter({ hasText: "小福星" }).first().click();
    await expect(page).toHaveURL(/\/comic\/\d+/);
  });
});

test.describe("工作台 /comic/[id]", () => {
  test("剧本模式项目应显示 Tab 导航", async ({ page }) => {
    await page.goto("/comic/2");
    await expect(page.getByRole("tab", { name: "概览" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("tab", { name: "剧本" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "资产" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "分镜" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "成片" })).toBeVisible();
  });

  test("切换到剧本 Tab 应显示章节和提取资产", async ({ page }) => {
    await page.goto("/comic/2");
    await expect(page.getByRole("tab", { name: "概览" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("tab", { name: "剧本" }).click();
    await expect(page.getByText("章节")).toBeVisible();
    await expect(page.getByRole("button", { name: "提取资产" })).toBeVisible();
  });

  test("切换到资产 Tab 应显示筛选器", async ({ page }) => {
    await page.goto("/comic/2");
    await expect(page.getByRole("tab", { name: "概览" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("tab", { name: "资产" }).click();
    await expect(page.getByRole("button", { name: "全部" })).toBeVisible();
    await expect(page.getByRole("button", { name: "角色" })).toBeVisible();
  });

  test("切换到成片 Tab 应显示导出按钮", async ({ page }) => {
    await page.goto("/comic/2");
    await expect(page.getByRole("tab", { name: "概览" })).toBeVisible({ timeout: 15000 });
    await page.getByRole("tab", { name: "成片" }).click();
    await expect(page.getByRole("button", { name: "导出" })).toBeVisible();
  });

  test("AI重绘项目应显示 4 步 stepper", async ({ page }) => {
    await page.goto("/comic/1");
    await expect(page.getByRole("navigation", { name: "重绘步骤" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: "1 原片" })).toBeVisible();
    await expect(page.getByRole("button", { name: "2 设定" })).toBeVisible();
  });
});

test.describe("资产库 /library", () => {
  test("应渲染 5 个分类 Tab", async ({ page }) => {
    await page.goto("/library");
    await expect(page.getByRole("tab", { name: /数字艺人/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /音色库/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /角色库/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /场景库/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /道具库/ })).toBeVisible();
  });

  test("数字艺人 Tab 应渲染艺人卡片", async ({ page }) => {
    await page.goto("/library");
    await expect(page.getByText("张阳阳")).toBeVisible();
    await expect(page.getByText("朱辰赫")).toBeVisible();
  });

  test("切换到音色库应渲染音色卡片", async ({ page }) => {
    await page.goto("/library");
    await page.getByRole("tab", { name: /音色库/ }).click();
    await expect(page.getByText("婆婆")).toBeVisible();
    await expect(page.getByText("武则天")).toBeVisible();
  });
});

test.describe("广场 /plaza", () => {
  test("应渲染三个 Tab 和剧本卡片", async ({ page }) => {
    await page.goto("/plaza");
    await expect(page.getByRole("button", { name: "剧本市场" })).toBeVisible();
    await expect(page.getByRole("button", { name: "项目接单" })).toBeVisible();
    await expect(page.getByRole("button", { name: "编剧推荐" })).toBeVisible();
  });

  test("搜索框应过滤剧本", async ({ page }) => {
    await page.goto("/plaza");
    const search = page.getByRole("textbox", { name: "搜索广场" });
    await search.fill("画灵");
    await expect(page.getByText("画灵觉醒")).toBeVisible();
  });

  test("切换到项目接单应渲染接单卡片", async ({ page }) => {
    await page.goto("/plaza");
    await page.getByRole("button", { name: "项目接单" }).click();
    await expect(page.getByText("买下黑市后")).toBeVisible();
  });

  test("切换到编剧推荐应渲染编剧卡片", async ({ page }) => {
    await page.goto("/plaza");
    await page.getByRole("button", { name: "编剧推荐" }).click();
    await expect(page.getByText("墨染青衣")).toBeVisible();
  });
});

test.describe("发布中心 /publish", () => {
  test("应渲染 6 个平台卡片", async ({ page }) => {
    await page.goto("/publish");
    await expect(page.getByText("绑定发布平台")).toBeVisible();
    await expect(page.getByText("抖音")).toBeVisible();
    await expect(page.getByText("快手")).toBeVisible();
    await expect(page.getByText("小红书")).toBeVisible();
  });

  test("点击绑定应经历绑定中→已绑定", async ({ page }) => {
    await page.goto("/publish");
    const bindButtons = page.getByRole("button", { name: "绑定账号" });
    await bindButtons.first().click();
    await expect(page.getByText("绑定中...")).toBeVisible();
    await expect(page.getByText("已绑定").first()).toBeVisible({ timeout: 3000 });
  });
});
