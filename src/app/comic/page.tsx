import { redirect } from "next/navigation";

// Loop B: /comic 已合并到 /project，统一项目中心入口
export default function ComicPage() {
  redirect("/project");
}
