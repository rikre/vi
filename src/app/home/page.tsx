import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { HotRanking } from "@/components/home/hot-ranking";
import { ContentPlazas } from "@/components/home/content-plazas";
import { ActivitySection } from "@/components/home/activity-section";
import { VideoGrid } from "@/components/home/video-grid";
import { CampaignLayer } from "@/components/home/campaign-layer";

export default function HomePage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto">
        <CampaignLayer />
        <HeroSection />
        <div className="mx-auto max-w-[1400px] px-6 pb-10">
          <HotRanking />
          <ContentPlazas />
          <VideoGrid />
          <ActivitySection />
          <Footer />
        </div>
      </div>
    </AppShell>
  );
}
