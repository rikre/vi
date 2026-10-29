import type { SVGProps } from "react";

/**
 * 官方品牌图标与文字标识；全站入口复用同一来源。
 */
export function BolloLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="96" height="32" viewBox="0 0 96 32" role="img" aria-label="菠萝视频" {...props}>
      <image href="https://bollo.video/images/home-v2/BOLLO%20icon.png" width="32" height="32" />
      <text x="39" y="23" fill="currentColor" fontSize="20" fontWeight="600">bollo</text>
    </svg>
  );
}

/** 新建 (Plus) - 16x16, currentColor */
export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M11 20V13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H11V4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4V11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H13V20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 项目 (FolderOpen) - 16x16, currentColor, 线性 */
export function FolderOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V10" />
      <path d="M3 9.5L5 19C5.1267 19.6297 5.7056 20 6.35 20H19.5C20.3284 20 21 19.3284 21 18.5V11.5C21 10.6716 20.3284 10 19.5 10H5.5C4.4 10 3.3 9.7 3 9.5Z" />
    </svg>
  );
}

/** 技能 (BookOpen) - 16x16, currentColor, 线性 */
export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 6.5C10.5 5 8 4 4 4V18C8 18 10.5 19 12 20.5" />
      <path d="M12 6.5C13.5 5 16 4 20 4V18C16 18 13.5 19 12 20.5" />
      <path d="M12 6.5V20.5" />
    </svg>
  );
}

/** 项目 (Folder) - 16x16, currentColor */
export function FolderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 资产 (Asset) - 16x16, currentColor */
export function AssetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 发布 (Publish/Upload) - 16x16, currentColor */
export function PublishIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 技能 (Skill/Book) - 16x16, currentColor */
export function SkillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 5.5C21 5.22386 20.7761 5 20.5 5H15C13.8954 5 13 5.89543 13 7V17.5713C13.7131 17.1754 14.5009 17 15.2773 17H20.5C20.7761 17 21 16.7761 21 16.5V5.5ZM3 16.5C3 16.7761 3.22386 17 3.5 17H8.72266C9.49914 17 10.2869 17.1754 11 17.5713V7C11 5.89543 10.1046 5 9 5H3.5C3.22386 5 3 5.22386 3 5.5V16.5ZM23 16.5C23 17.8807 21.8807 19 20.5 19H15.2773C14.7569 19 14.2769 19.125 13.877 19.3721C13.4561 19.6322 13.1158 20.0048 12.8945 20.4473C12.7251 20.786 12.3788 21 12 21C11.6212 21 11.2749 20.786 11.1055 20.4473C10.8842 20.0048 10.5439 19.6322 10.123 19.3721C9.72306 19.125 9.24312 19 8.72266 19H3.5C2.11929 19 1 17.8807 1 16.5V5.5C1 4.11929 2.11929 3 3.5 3H9C10.195 3 11.267 3.52463 12 4.35547C12.733 3.52463 13.805 3 15 3H20.5C21.8807 3 23 4.11929 23 5.5V16.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** WeChat - 20x20, currentColor */
export function WeChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="20"
      viewBox="-3 -3 20 20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.176 14.429c-2.665 0-4.826-1.8-4.826-4.018 0-2.22 2.159-4.02 4.824-4.02S16 8.191 16 10.411c0 1.21-.65 2.301-1.666 3.036a.32.32 0 0 0-.12.366l.218.81a.6.6 0 0 1 .029.117.166.166 0 0 1-.162.162.2.2 0 0 1-.092-.03l-1.057-.61a.5.5 0 0 0-.256-.074.5.5 0 0 0-.142.021 5.7 5.7 0 0 1-1.576.22M9.064 9.542a.647.647 0 1 0 .557-1 .645.645 0 0 0-.646.647.6.6 0 0 0 .09.353Zm3.232.001a.646.646 0 1 0 .546-1 .645.645 0 0 0-.644.644.63.63 0 0 0 .098.356" />
      <path d="M0 6.826c0 1.455.781 2.765 2.001 3.656a.385.385 0 0 1 .143.439l-.161.6-.1.373a.5.5 0 0 0-.032.14.19.19 0 0 0 .193.193q.06 0 .111-.029l1.268-.733a.6.6 0 0 1 .308-.088q.088 0 .171.025a6.8 6.8 0 0 0 1.625.26 4.5 4.5 0 0 1-.177-1.251c0-2.936 2.785-5.02 5.824-5.02l.15.002C10.587 3.429 8.392 2 5.796 2 2.596 2 0 4.16 0 6.826m4.632-1.555a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0m3.875" />
    </svg>
  );
}

/** 帮助 (Help/QuestionMark) - 16x16, currentColor */
export function HelpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M12 9C11.6227 9 11.2926 9.2086 11.1215 9.52152C10.8564 10.0061 10.2488 10.184 9.76426 9.91899C9.27972 9.65396 9.10177 9.04632 9.36679 8.56178C9.87463 7.63331 10.8626 7 12 7C13.5147 7 14.5669 8.00643 14.8664 9.189C15.1676 10.3779 14.7101 11.763 13.3416 12.4472C13.1323 12.5519 13 12.7659 13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.0084 11.5603 11.1018 12.4472 10.6584C12.902 10.431 13.0188 10.0397 12.9277 9.6801C12.835 9.31417 12.5283 9 12 9Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <path
        d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 纯图标品牌标记（不含 "bollo" 文字），用于窄侧栏 */
export function BolloMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" role="img" aria-label="菠萝视频" {...props}>
      <image href="https://bollo.video/images/home-v2/BOLLO%20icon.png" width="32" height="32" />
    </svg>
  );
}

/**
 * 页脚复用官方品牌标识，不另造反色图标。
 */
export function FooterLogo(props: SVGProps<SVGSVGElement>) {
  return <BolloLogo {...props} />;
}

/** X (Twitter) — 14x14, currentColor */
export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** YouTube — 14x14, currentColor */
export function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/** Instagram — 14x14, currentColor */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

/** Reddit — 14x14, currentColor */
export function RedditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 8c2.648 0 5.028 .826 6.675 2.14a2.5 2.5 0 0 1 2.326 4.36c0 3.59 -4.03 6.5 -9 6.5c-4.875 0 -8.845 -2.8 -9 -6.294l-1 -.206a2.5 2.5 0 0 1 2.326 -4.36c1.646 -1.313 4.026 -2.14 6.674 -2.14z" />
      <path d="M12 8l1 -5l6 1" />
      <path d="M19 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <circle cx="9" cy="13" fill="currentColor" r=".5" />
      <circle cx="15" cy="13" fill="currentColor" r=".5" />
      <path d="M10 17c.667 .333 1.333 .5 2 .5s1.333 -.167 2 -.5" />
    </svg>
  );
}

/** Bell (活动通知) - 18x18, currentColor */
export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/** Message (消息) - 18x18, currentColor */
export function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Crown (会员) - 16x16, currentColor */
export function CrownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}

/** Building (企业) - 16x16, currentColor */
export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect height="16" width="9" x="3" y="7" rx="1" />
      <path d="M12 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16" />
      <path d="M6 11h3M6 15h3M16 9h1M16 13h1M16 17h1" />
      <path d="M2 21h20" />
    </svg>
  );
}

/** ChevronDown - 14x14, currentColor */
export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/** Search - 16x16, currentColor */
export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** Trash/Recycle - 16x16, currentColor */
export function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/** Plus circle - 16x16, currentColor */
export function PlusCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

/** Upload - 16x16, currentColor */
export function UploadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** Heart/收藏 - 16x16, currentColor */
export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** More (三点) - 16x16, currentColor */
export function MoreIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

/** Sparkle/AI - 16x16, currentColor */
export function SparkleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
    </svg>
  );
}

/** User/Profile - 20x20, currentColor */
export function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/** Settings - 20x20, currentColor */
export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Logout - 20x20, currentColor */
export function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/** Credit/Coins - 16x16, currentColor */
export function CoinsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="8" cy="8" r="6" opacity="0.8" />
      <circle cx="16" cy="16" r="6" />
    </svg>
  );
}

/** Credits - 16x16, currentColor，线性硬币 */
export function CreditsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.7c-.8-.6-1.8-.9-2.9-.9-1.7 0-2.8.8-2.8 2 0 3.1 5.7 1.5 5.7 4.6 0 1.3-1.1 2.2-2.9 2.2-1.2 0-2.3-.4-3.1-1.1" />
      <path d="M12 5.8v12.4" />
    </svg>
  );
}

/** Edit/Pencil - 16x16, currentColor */
export function EditIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/** Camera - 16x16, currentColor */
export function CameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/** Smartphone - 16x16, currentColor */
export function SmartphoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

/** Mail - 16x16, currentColor */
export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Shield Check - 16x16, currentColor */
export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Chevron Right - 16x16, currentColor */
export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/** Chevron Left - 16x16, currentColor */
export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/** Play - 16x16, currentColor */
export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** Arrow Right - 16x16, currentColor */
export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/** User Group/Users - 16x16, currentColor */
export function UserGroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Help Circle - 16x16, currentColor */
export function HelpCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

/** Message Square - 16x16, currentColor */
export function MessageSquareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Info - 16x16, currentColor */
export function InfoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/** Gift - 16x16, currentColor */
export function GiftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

/** Scene/Landscape - 16x16, currentColor */
export function SceneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 21h18M3 7l6-4 6 4M21 17l-5-5-5 5-3-3-5 5" />
      <path d="M3 21V7M21 21V11" />
    </svg>
  );
}

/** Send (Send 按钮) - 14x14, currentColor */
export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

/** Document (Sidebar 文档) - 14x14, currentColor */
export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="14"
      viewBox="0 0 24 24"
      width="14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

/** Video Camera - 24x24, currentColor */
export function VideoCameraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="M16 10l4-2v8l-4-2" />
      <circle cx="9" cy="12" r="2" />
    </svg>
  );
}

/** Image/Picture - 24x24, currentColor */
export function ImageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

/** Close/X - 20x20, currentColor */
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/** Pause - 16x16, currentColor */
export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

/** Volume - 16x16, currentColor */
export function VolumeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

/** Link - 16x16, currentColor */
export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/** Prop/Mask - 16x16, currentColor */
export function PropIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 12a10 10 0 0 1 20 0" />
      <path d="M2 12a10 10 0 0 0 20 0" />
      <circle cx="8" cy="12" r="1.5" />
      <circle cx="16" cy="12" r="1.5" />
      <path d="M12 12v4" />
      <path d="M9 18c1.5 1 4.5 1 6 0" />
    </svg>
  );
}

/** Microphone - 16x16, currentColor */
export function MicrophoneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 1 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

/** Check - 16x16, currentColor */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** CheckCheck (双勾，全部已读) - 16x16, currentColor */
export function CheckCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

/** Edit3 (改写/编辑) - 16x16, currentColor, 线性 */
export function Edit3Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

/** Star (评分) - 16x16, currentColor, 线性 */
export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3 2.9 5.9 6.6.95-4.75 4.65 1.1 6.5L12 17.8 6.15 20l1.1-6.5L2.5 9.85l6.6-.95Z" />
    </svg>
  );
}

/** FileText (传剧本/文档) - 16x16, currentColor, 线性 */
export function FileTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </svg>
  );
}

/** Film (电影/分镜) - 16x16, currentColor, 线性 */
export function FilmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M2 8h5M2 16h5M17 8h5M17 16h5M7 12h10" />
    </svg>
  );
}

/** Globe - 16x16, currentColor, 线性 */
export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

/** Users - 16x16, currentColor, 线性 */
export function UsersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Share - 16x16, currentColor, 线性 */
export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

export function ScriptIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 3h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function RefreshCwIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

export function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function Volume2Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export function VolumeXIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

export function LayoutGridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function ScissorsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function ZoomInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

export function CpuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

export function ZoomOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/** Tray - 24x24, currentColor（空状态托盘） */
export function TrayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 14l3-8a2 2 0 0 1 1.9-1.3h8.2A2 2 0 0 1 18 6l3 8" />
      <path d="M3 14h5a2 2 0 0 1 2 1 2 2 0 0 0 4 0 2 2 0 0 1 2-1h5" />
      <path d="M3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

/** Palette - 24x24, currentColor（风格选择） */
export function PaletteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="13.5" cy="6.5" r="1.2" />
      <circle cx="17.5" cy="10.5" r="1.2" />
      <circle cx="8.5" cy="7.5" r="1.2" />
      <circle cx="6.5" cy="12.5" r="1.2" />
      <path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.4-.3-.4-.5-.9-.5-1.4 0-1.1.9-2 2-2h2.4a4.6 4.6 0 0 0 4.6-4.6C22 5.9 17.5 2 12 2Z" />
    </svg>
  );
}

/** TrendFlat - 24x24, currentColor（持平箭头） */
export function TrendFlatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 12h14" />
      <path d="m13 7 5 5-5 5" />
    </svg>
  );
}

/** TrendDown - 24x24, currentColor（下行箭头） */
export function TrendDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7l7 8h9" />
      <path d="m16 11 4 4-4 4" />
    </svg>
  );
}
