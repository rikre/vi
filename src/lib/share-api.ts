/**
 * 项目分享相关 API（当前为 mock 实现，后续对接真实后端）
 */

export type ShareVisibility = "public" | "team";

export interface ShareSettings {
  visibility: ShareVisibility;
  allowFork: boolean;
}

export interface ShareInfo {
  url: string;
  visibility: ShareVisibility;
  allowFork: boolean;
}

export interface ShareResult {
  success: boolean;
  message?: string;
  data?: ShareInfo;
}

export async function getProjectShareInfo(projectId: string): Promise<ShareResult> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    success: true,
    data: {
      url: `https://bollo.example.com/project/${projectId}`,
      visibility: "public",
      allowFork: false,
    },
  };
}

export async function updateProjectShare(
  projectId: string,
  settings: ShareSettings
): Promise<ShareResult> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    data: {
      url: `https://bollo.example.com/project/${projectId}`,
      visibility: settings.visibility,
      allowFork: settings.allowFork,
    },
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
