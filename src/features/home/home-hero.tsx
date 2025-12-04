import { HeroBanner } from "@/components/layout/hero-banner";
import { StatsGrid } from "@/components/threads/stats-grid";

export function HomeHero({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="space-y-6">
      <HeroBanner onCreate={onCreate} />
      <StatsGrid />
    </section>
  );
}
