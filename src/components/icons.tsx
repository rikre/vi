import type { SVGProps } from "react";

/**
 * bollo brand logo — stylized geometric 'b' icon + custom wordmark.
 * Design language: rounded modernist, playful yet premium,
 * with a distinctive negative-space 'o' that echoes creativity/play.
 * The icon uses a 28px square mark with an integrated film/play motif.
 */
export function BolloLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="96"
      height="28"
      viewBox="0 0 96 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="bollo"
      role="img"
      {...props}
    >
      {/* Rounded square background */}
      <rect x="0" y="0" width="28" height="28" rx="7" fill="#D4FF3F" />
      {/* Star with curved cutout */}
      <path
        d="M14 5.5L15.6 10.4L20.9 10.6L16.8 13.9L18.2 19L14 16.1L9.8 19L11.2 13.9L7.1 10.6L12.4 10.4L14 5.5Z"
        fill="#0D0D0D"
      />
      {/* Curved cutout on top-right of star */}
      <path
        d="M17.5 8.5C19.5 7 22 6.5 24 7C22.5 8 20.5 9.5 19.5 11.5C19 10 18 9 17.5 8.5Z"
        fill="#D4FF3F"
      />
      {/* Wordmark */}
      <text
        x="34"
        y="20.5"
        fill="#FFFFFF"
        fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
        fontSize="19"
        fontWeight="600"
        letterSpacing="-0.8px"
      >
        bollo
      </text>
    </svg>
  );
}

/** 发现 (Discover) - 16x16, currentColor */
export function DiscoverIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M13.9999 15.8364C13.9998 15.2842 13.5521 14.8364 12.9999 14.8364H10.9999C10.4477 14.8364 9.99991 15.2842 9.99991 15.8364V19.8364H13.9999V15.8364ZM15.9999 19.8364H16.7997C17.3763 19.8364 17.7488 19.8361 18.0321 19.8129C18.3036 19.7908 18.4045 19.7535 18.4616 19.7237C18.6274 19.6389 18.7637 19.5026 18.8485 19.3368C18.8783 19.2797 18.9156 19.1788 18.9377 18.9073C18.9609 18.624 18.9612 18.2515 18.9612 17.6749V13.8364C18.9612 13.2841 18.5135 12.8364 17.9612 12.8364H15.9999V19.8364Z"
        fill="currentColor"
      />
      <path
        clipRule="evenodd"
        d="M9.99967 7.66683C10.2649 7.66683 10.5192 7.77226 10.7067 7.9598C10.8942 8.14733 10.9997 8.40162 10.9997 8.66683V10.6668C10.9997 10.9227 10.898 11.1681 10.7169 11.3495C10.5359 11.5308 10.2907 11.6328 10.0348 11.6335L5.36634 11.6335C5.11051 11.6328 4.86523 11.5308 4.6842 11.3495C4.50317 11.1681 4.40142 10.9227 4.40142 10.6668V8.66683C4.40142 8.40162 4.50685 8.14733 4.69439 7.9598C4.88192 7.77226 5.13621 7.66683 5.40142 7.66683H9.99967Z"
        fill="currentColor"
      />
      <path
        clipRule="evenodd"
        d="M7.99967 1.3335C11.6816 1.3335 14.6663 4.31826 14.6663 8.00016C14.6663 11.6821 11.6816 14.6668 7.99967 14.6668C4.31778 14.6668 1.33301 11.6821 1.33301 8.00016C1.33301 4.31826 4.31778 1.3335 7.99967 1.3335ZM7.05957 5.19287C6.69076 5.50396 6.25521 5.82478 5.78288 6.118C4.9015 6.66514 3.83078 7.16162 2.7679 7.32568L2.70866 7.33415C2.68147 7.55238 2.66634 7.77457 2.66634 8.00016C2.66634 10.9457 5.05416 13.3335 7.99967 13.3335C10.9452 13.3335 13.333 10.9457 13.333 8.00016C13.333 7.46663 13.2536 6.95172 13.1059 6.46663L13.0854 6.47554C12.0634 6.8652 10.9407 6.84883 10.0082 6.41659C9.0758 5.98436 8.39934 5.17996 8.25228 4.23328L8.23806 4.13786C7.81934 4.41492 7.42837 4.74891 7.05957 5.19287Z"
        fill="currentColor"
      />
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

/** 广场 (Plaza/Market) - 16x16, currentColor */
export function PlazaIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M4 21h16M6 21V10l6-4 6 4v11M9 21v-5h6v5"
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

/** Discord - 16x16, currentColor */
export function DiscordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M13.5447 2.77046C12.5249 2.30254 11.4313 1.9578 10.2879 1.76035C10.2671 1.75654 10.2463 1.76606 10.2356 1.78511C10.0949 2.03525 9.93915 2.36158 9.83006 2.61808C8.60027 2.43397 7.37679 2.43397 6.17221 2.61808C6.0631 2.35588 5.90166 2.03525 5.76038 1.78511C5.74966 1.7667 5.72886 1.75717 5.70803 1.76035C4.56527 1.95717 3.47171 2.30191 2.45129 2.77046C2.44246 2.77427 2.43488 2.78063 2.42986 2.78887C0.355594 5.88778 -0.212633 8.91052 0.0661201 11.8958C0.0673814 11.9104 0.0755799 11.9244 0.086932 11.9332C1.45547 12.9383 2.78114 13.5484 4.08219 13.9528C4.10301 13.9592 4.12507 13.9516 4.13832 13.9344C4.44608 13.5141 4.72043 13.071 4.95565 12.6049C4.96953 12.5777 4.95628 12.5453 4.92791 12.5345C4.49275 12.3694 4.0784 12.1681 3.67982 11.9396C3.64829 11.9212 3.64577 11.8761 3.67477 11.8545C3.75865 11.7916 3.84255 11.7263 3.92264 11.6602C3.93713 11.6482 3.95732 11.6456 3.97435 11.6532C6.59286 12.4524 9.4088 12.4524 12.0266 11.6532C12.0436 11.6451 12.0638 11.6477 12.0789 11.6597C12.1589 11.7258 12.2428 11.7916 12.3274 11.8545C12.3564 11.8761 12.3545 11.9212 12.323 11.9396C11.9244 12.1737 11.5101 12.3694 11.0743 12.5339C11.0459 12.5446 11.0333 12.5777 11.0472 12.6049C11.2881 13.0704 11.5624 13.5135 11.8639 13.9338C11.8765 13.9516 11.8992 13.9592 11.92 13.9528C13.2274 13.5484 14.5531 12.9383 15.9216 11.9332C15.9336 11.9244 15.9412 11.911 15.9425 11.8964C16.2723 8.45686 15.3775 5.45763 13.5659 2.7895C13.5615 2.78063 13.5539 2.77427 13.5447 2.77046Z"
        fill="currentColor"
      />
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

/** Hand-wave icon used in greeting — 60x60, brand lime fill #D4FF3F */
export function WaveHand(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.8207 31.7336C53.8068 38.384 50.9581 49.6876 41.2643 49.6876H17.7985C8.34042 49.6876 5.39951 38.9416 8.96549 32.2405C9.80576 30.6692 10.3591 29.7568 10.9227 28.0131C11.3121 26.7965 11.6502 25.7017 12.6749 24.3229C13.8739 22.711 16.1282 23.0152 15.5646 25.0224C15.4826 25.3164 15.3699 25.7219 15.2982 26.0565C15.083 27.1007 15.6773 27.638 16.3741 27.6684C17.0505 27.6887 17.8395 27.2426 17.8395 26.0159C17.8395 22.4981 18.7617 19.3859 21.2313 17.6219C22.8913 16.4256 24.4693 16.9933 23.6701 19.2743C23.5369 19.6494 23.2602 20.278 23.168 20.866C22.8708 22.7414 25.576 22.9848 25.9244 21.4033C25.9962 21.0687 26.0167 20.6734 26.0372 20.2983C26.0986 18.1592 27.1643 17.0947 28.4862 16.0201C30.2282 14.6211 29.7364 13.8405 29.9003 11.9245C30.0643 9.90706 31.8063 10.0287 32.8105 10.9918C35.6182 13.6682 35.9973 17.186 35.6079 19.7711C34.9521 24.1506 40.0449 23.9884 39.5633 20.5314C39.4813 19.9536 39.3481 19.2338 39.2764 18.3924C39.0919 16.0708 41.1926 16.2026 42.576 17.5712C43.9798 18.9499 45.1172 20.9673 45.5989 22.8834C46.6441 27.0905 47.6893 28.1956 49.8207 31.7438V31.7336Z"
        fill="#D4FF3F"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.3559 33.082C19.6121 34.2782 21.2414 34.6229 21.7332 32.7271C22.1124 31.2673 23.383 28.7633 25.043 30.071C26.3444 31.095 26.9524 32.9593 26.6245 34.8238C26.4006 36.0967 26.1757 37.4249 26.9524 38.0914C27.6953 38.7301 28.8196 38.3365 29.0664 37.1289C29.3146 35.9148 29.1504 34.5685 29.1504 33.3313C29.1504 32.1199 30.2457 31.4815 31.0967 32.2389C31.8561 32.9127 31.7276 34.2782 31.7276 35.5234C31.7276 36.7687 31.6656 37.954 31.9647 38.5824C32.2639 39.2107 33.2683 39.1444 33.5553 38.4747C33.8424 37.805 33.7223 36.578 33.7223 35.5234C33.7223 34.4689 33.5857 33.3324 33.9167 32.4936C34.2476 31.6548 35.2895 31.6139 35.7229 32.3976C36.1562 33.1813 35.9119 34.6842 35.9119 35.8137C35.9119 36.9433 35.7713 37.9274 36.0694 38.4083C36.3675 38.8892 37.1563 38.8514 37.477 38.3152C37.7977 37.7791 37.7014 36.6834 37.7014 35.7679C37.7014 34.8525 37.5901 33.9537 37.9281 33.3161C38.2661 32.6786 39.1529 32.7106 39.5159 33.3383C39.8788 33.9661 39.8162 35.0841 39.8162 36.0931C39.8162 37.1022 39.8015 38.0124 39.4955 38.4985C39.1895 38.9846 38.3575 38.9325 37.9915 38.4083C37.6255 37.8842 37.7014 36.8611 37.7014 35.7679C37.7014 34.6748 37.5353 33.5661 37.2054 33.1912C36.8756 32.8162 36.2242 32.7337 35.6343 32.8614C35.0445 32.9891 34.5579 33.3671 34.2736 33.9731C33.9893 34.579 33.9287 35.4327 33.9167 36.2517C33.9046 37.0708 33.9406 37.8426 33.5553 38.4747C33.17 39.1069 32.1793 39.0902 31.7276 38.4083C31.2758 37.7264 31.3863 36.4998 31.3863 35.412C31.3863 34.3242 31.3157 33.2372 30.8603 32.6932C30.4049 32.1492 29.5194 32.1732 29.0503 32.7561C28.5812 33.339 28.5738 34.4494 28.5664 35.4759C28.559 36.5025 28.5515 37.5453 28.1401 38.0914C27.7287 38.6376 26.7948 38.5569 26.398 37.9439C26.0011 37.3309 26.0413 36.1426 26.0413 35.0767C26.0413 34.0109 25.9797 32.9711 25.4741 32.4936C24.9686 32.016 24.0695 32.1356 23.5918 32.7561C23.1142 33.3766 22.9594 34.4941 22.6217 35.4759C22.2841 36.4578 21.7655 37.3309 20.8444 37.4984C19.9233 37.6659 19.0696 37.0979 19.0536 36.0931C19.0377 35.0883 19.5355 33.9537 19.3559 33.082Z"
        fill="#E6F06B"
      />
    </svg>
  );
}

/**
 * bollo footer logo — inverted-color version of BolloLogo for dark backgrounds.
 * Preserves the rounded-square + star + curved-cutout shape system of the
 * header BolloLogo, but flips the palette so it reads on dark surfaces:
 * white rounded background, dark star, light cutout, white wordmark.
 */
export function FooterLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="96"
      height="28"
      viewBox="0 0 96 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="bollo"
      {...props}
    >
      <title>bollo</title>
      {/* Rounded square background — inverted to white for dark surfaces */}
      <rect x="0" y="0" width="28" height="28" rx="7" fill="#FFFFFF" />
      {/* Star with curved cutout — same geometry as BolloLogo */}
      <path
        d="M14 5.5L15.6 10.4L20.9 10.6L16.8 13.9L18.2 19L14 16.1L9.8 19L11.2 13.9L7.1 10.6L12.4 10.4L14 5.5Z"
        fill="#0D0D0D"
      />
      {/* Curved cutout on top-right of star — matches background color */}
      <path
        d="M17.5 8.5C19.5 7 22 6.5 24 7C22.5 8 20.5 9.5 19.5 11.5C19 10 18 9 17.5 8.5Z"
        fill="#FFFFFF"
      />
      {/* Wordmark — light for dark footer background */}
      <text
        x="34"
        y="20.5"
        fill="#FFFFFF"
        fontFamily="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
        fontSize="19"
        fontWeight="600"
        letterSpacing="-0.8px"
      >
        bollo
      </text>
    </svg>
  );
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

/** Play Circle - 24x24, currentColor */
export function PlayCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm14.024-.983a1.125 1.125 0 0 1 0 1.966l-5.603 3.113A1.125 1.125 0 0 1 9 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113Z" clipRule="evenodd" />
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

/** Maximize/Fullscreen - 16x16, currentColor */
export function MaximizeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

/** Eye/Views - 16x16, currentColor */
export function EyeIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

/** Script/剧本 - 16x16, currentColor */
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

/** RefreshCw/AI重绘 - 16x16, currentColor */
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

/** Layers/自由模式 - 16x16, currentColor */
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

/** Arrow Left - 16x16, currentColor */
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

/** Download - 16x16, currentColor */
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

/** Volume 2 (volume on) - 16x16, currentColor */
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

/** Volume X (muted) - 16x16, currentColor */
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

/** LayoutGrid - 16x16, currentColor */
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

/** Scissors - 16x16, currentColor */
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

/** Zoom In - 16x16, currentColor */
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

/** Cpu/流水线 - 16x16, currentColor */
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

/** Zoom Out - 16x16, currentColor */
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
