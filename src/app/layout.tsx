import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "bollo - AI 动画创作工作台",
  description:
    "bollo 是专业的 AI 动画创作平台，帮你高效完成角色、场景、分镜和动画短片制作。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "bollo - AI 动画创作工作台",
    description: "想象力，即刻呈现。用 bollo 高效创作 AI 动画、分镜与短片。",
    images: ["https://placehold.co/1200x630/141414/D4FF3F?text=bollo"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bollo - AI 动画创作工作台",
    description: "想象力，即刻呈现。用 bollo 高效创作 AI 动画、分镜与短片。",
    images: ["https://placehold.co/1200x630/141414/D4FF3F?text=bollo"],
  },
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
