"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

const AI_TOPIC_TEMPLATE = (title: string, subtitle: string) => ({
  title,
  points: [
    `剧名：《${title}》`,
    "频道：女频",
    "题材：都市喜剧，先婚后爱，家庭伦理",
    `一句话：${subtitle}`,
    "受众：在家庭关系中缺乏话语权、深受不敬长辈及亲戚困扰的女性，想看打破豪门规矩的阶级逆袭爽感。",
    "内核：用最接地气的底层生存智慧与物理压制，粉碎虚伪腐朽，重建充满人情味的家庭新秩序。",
    "主线：东北农家乐泼辣女老板王春花阴差阳错救了京圈豪门老太爷，两人为躲避各自麻烦签了闪婚协议。婚礼当晚老太爷昏迷，遗嘱曝光：全部家产与家族话语权交给王春花。",
    "亮点：极致辈分压制加阶级反差，农家乐大妈爆改豪门话事人，用最粗暴的乡村魔法打败豪门做派。",
  ],
});

const OUTLINE = [
  {
    episode: "第1-5集",
    title: "闪婚豪门，遗嘱惊雷",
    summary:
      "王春花为躲债误入豪门寿宴，阴差阳错救了突发心梗的霍老太爷。为应付媒体，两人签下闪婚协议。婚礼当晚老太爷昏迷，遗嘱曝光：全部家产与家族话语权交给王春花。霍家上下炸锅，王春花被迫开启豪门整顿之旅。",
  },
  {
    episode: "第6-15集",
    title: "辈分压制，初显威风",
    summary:
      "王春花以'太奶奶'身份召开家族会议，停掉三个玄孙的黑卡，把闹事的长媳怼到哑口无言。她带着富三代们回东北老家体验生活，铲猪粪、睡火炕，把娇生惯养的少爷小姐们折腾得叫苦连天，却也在潜移默化中改变着他们。",
  },
  {
    episode: "第16-30集",
    title: "内鬼浮现，危机四伏",
    summary:
      "私生子霍明远联合外人做空霍氏股价，长媳暗中转移资产。王春花凭借东北女人特有的敏锐与泼辣，一次次化解危机。她发现老太爷昏迷并非偶然，开始暗中追查真凶。",
  },
  {
    episode: "第31-45集",
    title: "真相大白，家族洗牌",
    summary:
      "王春花设计引蛇出洞，查出霍明远才是谋害老太爷的真凶。在董事会上，她拿着证据当众揭穿阴谋，配合警方将霍明远绳之以法。霍家经历大地震后，王春花重新分配产业，让真正有能力的人上位。",
  },
  {
    episode: "第46-60集",
    title: "真情流露，圆满收官",
    summary:
      "老太爷苏醒，看到的是一个焕然一新的家族。王春花本想功成身退，却被老太爷和孩子们真心挽留。最终，这个曾经乌烟瘴气的豪门，在王春花的'乡村魔法'下变成了有温度、有担当的大家庭。",
  },
];

const CHARACTERS = [
  { name: "王春花", role: "女主", desc: "东北农家乐女老板，泼辣直爽，底层生存智慧满分，意外成为霍家最高辈分掌权人。" },
  { name: "霍老太爷", role: "男主", desc: "京圈豪门霍家创始人，睿智深沉，被王春花的真诚与魄力打动。" },
  { name: "霍景行", role: "大玄孙", desc: "霍家太子爷，表面纨绔，内心善良，是王春花重点'改造'对象。" },
  { name: "霍明远", role: "反派", desc: "霍家私生子，野心勃勃，为夺家产不择手段。" },
];

type ContentProps = {
  active: string;
  script: {
    id: string;
    title: string;
    subtitle: string;
    tags: string[];
    episodes: number;
    price: number;
  };
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-start gap-3">
      <span className="text-[12px] text-white/40">{label}</span>
      <span className="text-white/80">{value}</span>
    </div>
  );
}

export function ContentPanel({ active, script }: ContentProps) {
  const aiTopic = useMemo(
    () => AI_TOPIC_TEMPLATE(script.title, script.subtitle),
    [script.title, script.subtitle],
  );

  if (active === "ai") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">AI选题</h2>
        <ol className="space-y-3.5 text-[13px] leading-relaxed text-white/70">
          {aiTopic.points.map((point, i) => (
            <li key={i} className="flex gap-2">
              <span className="shrink-0 text-white/40">{i + 1}、</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  if (active === "plan") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">剧本策划</h2>
        <div className="grid gap-y-4 text-[13px]">
          <Row label="剧本名称" value={script.title} />
          <Row label="副标题" value={script.subtitle} />
          <Row label="总集数" value={`${script.episodes} 集`} />
          <Row
            label="题材"
            value={
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-white/70">
                {script.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            }
          />
          <Row label="市场" value="国内" />
          <Row label="单集时长" value="1 - 1.5 分钟" />
        </div>
      </div>
    );
  }

  if (active === "outline") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">剧本大纲</h2>
        <div className="divide-y divide-white/[0.06]">
          {OUTLINE.map((item, i) => (
            <div key={item.episode} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-white">
                <span className="text-white/40 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  {item.episode} · {item.title}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-white/55">
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "characters") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">角色设定</h2>
        <div className="divide-y divide-white/[0.06]">
          {CHARACTERS.map((c) => (
            <div key={c.name} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-[14px] font-medium text-white">
                  {c.name}
                </span>
                <span className="text-[11px] text-white/40">{c.role}</span>
              </div>
              <p className="text-[12px] leading-relaxed text-white/55">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (active === "world") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">世界设定</h2>
        <p className="text-[13px] leading-relaxed text-white/65">
          故事发生在现代都市背景下，以京圈豪门霍家与东北农家乐两个截然不同的世界为核心场景。霍家是掌控百亿资产的商业帝国，家族成员众多，关系错综复杂，表面光鲜亮丽，内里勾心斗角。王春花的东北老家则是充满烟火气的普通家庭，热炕头、杀猪菜、邻里乡亲构成了质朴温暖的生活图景。两个世界的碰撞，既是阶层差异的戏剧冲突，也是人情冷暖的价值观碰撞。
        </p>
      </div>
    );
  }

  if (active === "ep1" || active === "ep2") {
    return (
      <div className="space-y-6">
        <h2 className="text-[15px] font-medium text-white">
          {active === "ep1" ? "1-5集" : "6-10集"} 剧本正文
        </h2>
        <article>
          <p className="mb-4 text-[13px] font-medium text-white">
            第一集 · 寿宴惊变
          </p>
          <div className="space-y-3 text-[12.5px] leading-relaxed text-white/65">
            <p>【内景·霍家老宅·夜】</p>
            <p>
              水晶吊灯下，霍家老太爷的九十寿宴正酣。王春花端着托盘在后厨帮忙，身上还沾着面粉。她一边擦汗一边嘀咕：&lsquo;这豪门办个寿宴，规矩比咱村杀猪还多。&rsquo;
            </p>
            <p>
              前厅突然传来骚动。王春花探头一看，只见霍老太爷捂着胸口倒在地上，周围的贵太太们只会尖叫。她甩开膀子冲上去，熟练地做心肺复苏，一边按一边喊：&lsquo;都让开！别围着！空气都被你们吸没了！&rsquo;
            </p>
            <p>
              救护车赶到时，老太爷已经恢复意识。他虚弱地抓住王春花的手：&lsquo;姑娘，你救了我一命……&rsquo;
            </p>
            <p>
              王春花摆摆手：&lsquo;大爷，您这寿宴我白干了，能把工钱结一下不？&rsquo;
            </p>
            <p>满场哗然。</p>
          </div>
        </article>
      </div>
    );
  }

  if (active === "ep3") {
    return (
      <div className="flex h-[280px] flex-col items-center justify-center text-center">
        <div className="mb-3 text-2xl text-white/40">🔒</div>
        <p className="text-[14px] font-medium text-white">11-60集内容已锁定</p>
        <p className="mt-1 text-[12px] text-white/50">购买后可查看完整剧本</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[15px] font-medium text-white">购买与保障须知</h2>
      <div className="space-y-3 text-[13px] leading-relaxed text-white/65">
        <p>
          1. 购买后您可获得该剧本的完整使用权，包括改编、拍摄、发行等权利。
        </p>
        <p>
          2. 平台提供7天无理由退款服务，购买后7天内未下载剧本可申请全额退款。
        </p>
        <p>
          3.
          剧本已通过平台原创性审核，如发现抄袭问题，平台将协助维权并全额赔付。
        </p>
        <p>4. 购买后可加入编剧沟通群，获得一次免费修改对接服务。</p>
        <p>5. 如需试读更多内容，可点击右侧「试读剧本」按钮。</p>
      </div>
    </div>
  );
}
