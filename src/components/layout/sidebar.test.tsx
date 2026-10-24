import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./sidebar";

const mocks = vi.hoisted(() => ({
  usePathname: vi.fn<() => string>(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mocks.usePathname,
}));

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    status: "unauthenticated",
    user: null,
    showLogin: vi.fn(),
  }),
}));

const NAV_ITEMS = [
  ["创作", "/home"],
  ["项目", "/project"],
  ["剧本", "/script/market"],
  ["资产", "/library"],
  ["工具", "/tools"],
  ["Skills", "/skill"],
] as const;

function renderSidebar() {
  return render(<Sidebar onOpenMessages={vi.fn()} />);
}

function getMainNavigation() {
  return screen.getByRole("navigation", { name: "Home v2 side navigation" });
}

describe("Sidebar reference navigation", () => {
  beforeEach(() => {
    mocks.usePathname.mockReturnValue("/home");
  });

  it("renders the six reference items in order and removes legacy entries", () => {
    renderSidebar();
    const nav = getMainNavigation();
    const labels: string[] = NAV_ITEMS.map(([label]) => label);
    const links = within(nav)
      .getAllByRole("link")
      .filter((link) => labels.includes(link.textContent ?? ""));

    expect(links.map((link) => link.textContent)).toEqual(labels);
    for (const [label, href] of NAV_ITEMS) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(within(nav).queryByRole("link", { name: "广场" })).not.toBeInTheDocument();
    expect(within(nav).queryByRole("button", { name: "发布" })).not.toBeInTheDocument();
  });

  it("uses the brand foreground without an active background or indicator", () => {
    renderSidebar();
    const active = within(getMainNavigation()).getByRole("link", { name: "创作" });

    expect(active).toHaveAttribute("aria-current", "page");
    expect(active).toHaveClass("text-brand");
    expect(active).not.toHaveClass("bg-brand/10");
    expect(active.querySelector("span[aria-hidden].bg-brand")).toBeNull();
  });

  it("applies the extracted typography, spacing, and inactive states", () => {
    renderSidebar();
    const nav = getMainNavigation();
    const active = within(nav).getByRole("link", { name: "创作" });
    const inactive = within(nav).getByRole("link", { name: "项目" });

    expect(active).toHaveClass("gap-1", "duration-[160ms]", "md:w-[56px]", "md:scale-90");
    expect(within(active).getByText("创作")).toHaveClass(
      "text-[11px]",
      "font-bold",
      "leading-3",
    );
    expect(inactive).toHaveClass(
      "text-white/[0.54]",
      "hover:bg-white/[0.05]",
      "hover:text-white/[0.82]",
    );
  });

  it("keeps comic detail routes under the project navigation", () => {
    mocks.usePathname.mockReturnValue("/comic/project-1/storyboard");
    renderSidebar();
    const nav = getMainNavigation();

    expect(within(nav).getByRole("link", { name: "项目" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "创作" })).not.toHaveAttribute("aria-current");
  });

  it("marks the existing Skills route as current", () => {
    mocks.usePathname.mockReturnValue("/skill");
    renderSidebar();

    expect(within(getMainNavigation()).getByRole("link", { name: "Skills" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
