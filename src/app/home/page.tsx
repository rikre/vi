import { AppShell } from "@/components/layout/app-shell";
import { Footer } from "@/components/layout/footer";
import { Greeting } from "@/components/home/greeting";
import { ProjectsSection } from "@/components/home/projects-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ActivitySection } from "@/components/home/activity-section";
import { VideoGrid } from "@/components/home/video-grid";

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto h-full max-w-[1400px] overflow-y-auto px-6 pb-10">
        <Greeting />
        <ProjectsSection />
        <FeaturesSection />
        <ActivitySection />
        <VideoGrid />
        <Footer />
      </div>
    </AppShell>
  );
}
