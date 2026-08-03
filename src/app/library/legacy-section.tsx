"use client";

import { EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { LEGACY_CARDS, TAB_LABEL_MAP, txi, type LegacyCard, type TabId } from "./data";
import { EmptyState } from "./empty-state";

export function LegacySection({
  type,
  searchQuery,
}: {
  type: Exclude<TabId, "artist" | "voice">;
  searchQuery: string;
}) {
  const cards = LEGACY_CARDS[type].filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() =>
            console.log(
              type === "character"
                ? "create character"
                : type === "scene"
                  ? "create scene"
                  : "create prop",
            )
          }
          className="flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[14px] font-medium text-black transition-opacity hover:opacity-80"
        >
          <PlusIcon className="size-4" />
          {TAB_LABEL_MAP[type]}
        </button>
      </div>

      {cards.length === 0 ? (
        <EmptyState type={type} />
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((card) => (
            <LegacyCardItem key={card.id} card={card} type={type} />
          ))}
        </div>
      )}
    </>
  );
}

function LegacyCardItem({
  card,
  type,
}: {
  card: LegacyCard;
  type: Exclude<TabId, "artist" | "voice">;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-[#141414] ring-1 ring-white/[0.08]">
      <button
        type="button"
        onClick={() => console.log("查看资产卡片", card.name)}
        className="relative block w-full"
        style={{ aspectRatio: "16 / 9" }}
      >
        <img
          src={txi(card.imagePrompt, "landscape_4_3")}
          alt={card.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </button>

      <div className="flex items-center justify-between gap-1 px-3 py-2.5">
        <h3 className="truncate text-[14px] font-medium text-white">
          {card.name}
        </h3>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="编辑"
            onClick={() => console.log("edit", card.id)}
            className="flex items-center px-2 py-1 text-white/70 transition-colors hover:text-white"
          >
            <EditIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="删除"
            onClick={() => console.log("delete", card.id)}
            className="flex items-center px-2 py-1 text-white/70 transition-colors hover:text-white"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
