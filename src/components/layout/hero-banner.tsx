import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-500 via-purple-600 to-rose-600 dark:from-brand-600 dark:via-purple-700 dark:to-rose-700 p-5 sm:p-8 text-white shadow-2xl">
      <div className="absolute inset-0 opacity-30 dark:opacity-50" style={{ backgroundImage: "url('/noise.png')" }} aria-hidden />
      <div className="relative flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] text-white/70">Campus edition</p>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-[1.1]">
            Spin up pop-up communities in seconds
          </h2>
          <p className="max-w-2xl text-sm sm:text-base text-white/80">
            Launch location-aware event threads with ephemeral chats, alerts, and member verification. Everything updates in real-time and expires automatically when energy fades.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            12 live threads right now
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:gap-3">
          <Button size="lg" className="h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-slate-900 shadow-glow text-sm sm:text-base" onClick={onCreate}>
            Launch new thread
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" className="h-10 sm:h-12 rounded-xl sm:rounded-2xl border-white/30 bg-transparent text-white text-sm sm:text-base" onClick={onCreate}>
            Browse templates
          </Button>
        </div>
      </div>
    </section>
  );
}
