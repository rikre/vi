import { txi } from "@/app/library/data";

export type Campaign = {
  id: string;
  title: string;
  coverUrl: string;
  endsInLabel: string;
  participantsLabel: string;
  kind: "ongoing" | "past";
  specialRouteKey: string | null;
  description: string;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "68046b0d-1b37-4de1-8f69-04103132a63e",
    title: "bollo “一键出海” 玩法介绍",
    coverUrl: txi(
      "minimal globe and rocket illustration, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "184天后结束",
    participantsLabel: "成为第一个参与者",
    kind: "ongoing",
    specialRouteKey:
      "https://ecncw7du1qtr.feishu.cn/wiki/UrTQwWgeLiLALAkb4AWcltpvnOe?from=from_copylink",
    description: "使用 bollo 一键生成多语言版本短剧，快速出海分发到全球市场。",
  },
  {
    id: "1fee866f-135e-49bd-ae6e-423df7a5ac7f",
    title: "bollo超创计划 纳新啦",
    coverUrl: txi(
      "minimal creator community illustration, diverse silhouettes collaborating, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "163天后结束",
    participantsLabel: "738 人已参与",
    kind: "ongoing",
    specialRouteKey: null,
    description:
      "加入 bollo 超创计划，获得算力加成、专属流量扶持与官方运营支持，创作优质短剧内容赢取额外奖励。",
  },
  {
    id: "d1c2134c-35fd-44c4-b3c1-24b9c182e060",
    title: "bollo 2.0 使用说明书",
    coverUrl: txi(
      "minimal open book guide illustration, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "10天后结束",
    participantsLabel: "1 人已参与",
    kind: "ongoing",
    specialRouteKey:
      "https://ecncw7du1qtr.feishu.cn/wiki/OHXrwS10Ni7bUZkzuXicT55Jn3g?from=from_copylink",
    description: "bollo 2.0 全新功能与操作指南，帮助你快速上手创作流程。",
  },
  {
    id: "57fbbe31-a97f-4a90-a521-3c216cc0e77c",
    title: "「用bollo让主队夺冠」内容征集大赛",
    coverUrl: txi(
      "minimal trophy and sports stadium illustration, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "12小时前结束",
    participantsLabel: "381 人已参与",
    kind: "past",
    specialRouteKey: null,
    description: "用 bollo 为主队创作助威内容，参与征集大赛赢取算力奖励。活动已结束。",
  },
  {
    id: "19d0eabe-22aa-48a9-94dd-2a571a4ef86a",
    title: "算力锦鲤来袭！",
    coverUrl: txi(
      "minimal koi fish and gift box illustration, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "20天前结束",
    participantsLabel: "成为第一个参与者",
    kind: "past",
    specialRouteKey: "lucky-draw",
    description: "限时算力锦鲤抽奖活动，幸运用户可获得大额算力加赠。活动已结束。",
  },
  {
    id: "9980fa0c-8663-4073-9be9-8b32148664b4",
    title: "我用bollo复刻经典名场面",
    coverUrl: txi(
      "minimal film clapperboard and cinema curtain illustration, lime green accent, dark background, simple clean design",
      "landscape_4_3",
    ),
    endsInLabel: "21天前结束",
    participantsLabel: "200 人已参与",
    kind: "past",
    specialRouteKey: null,
    description: "用 bollo 复刻影视经典名场面，分享你的二创作品。活动已结束。",
  },
];

export function findCampaign(idOrKey: string): Campaign | undefined {
  return CAMPAIGNS.find(
    (c) => c.id === idOrKey || c.specialRouteKey === idOrKey,
  );
}
