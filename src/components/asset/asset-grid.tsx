import { PlusCircleIcon, MoreIcon, HeartIcon } from "@/components/icons";

type Asset = {
  id: number;
  name: string;
  type: string;
  tag?: string;
};

type AssetCardProps = {
  asset?: Asset;
  isNew?: boolean;
  newLabel?: string;
};

function AssetCard({ asset, isNew, newLabel = "新建" }: AssetCardProps) {
  if (isNew || !asset) {
    return (
      <button
        type="button"
        className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] text-white/40 transition-all hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
      >
        <PlusCircleIcon className="size-10 transition-transform group-hover:scale-110" />
        <span className="text-[14px] font-medium">{newLabel}</span>
      </button>
    );
  }

  return (
    <div className="group relative flex aspect-square flex-col overflow-hidden rounded-xl bg-card transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.1] hover:shadow-lg hover:shadow-black/20">
      <div className="relative flex-1 overflow-hidden">
        <img
          src={`https://console.enterprise.trae.cn/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
            `${asset.type === "character" ? "anime character design reference sheet" : asset.type === "scene" ? "anime background scene illustration" : "anime prop item design"}, ${asset.name}, high quality, detailed, bollo brand lime green accent, dark theme`
          )}&image_size=square`}
          alt={asset.name}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div className="absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            aria-label="收藏"
          >
            <HeartIcon className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            aria-label="更多操作"
          >
            <MoreIcon className="size-4" />
          </button>
        </div>

        {asset.tag && (
          <div className="absolute left-2 top-2 rounded-md bg-brand/90 px-2 py-0.5 text-[10px] font-bold text-brand-foreground backdrop-blur-sm">
            {asset.tag}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-[13px] font-medium text-white transition-colors group-hover:text-brand">
          {asset.name}
        </h3>
      </div>
    </div>
  );
}

type AssetGridProps = {
  assets: Asset[];
  newLabel?: string;
};

export function AssetGrid({ assets, newLabel }: AssetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <AssetCard isNew newLabel={newLabel} />
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
