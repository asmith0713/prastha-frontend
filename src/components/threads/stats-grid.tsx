import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STAT_CARDS = [
  { label: "Active threads", value: "14", accent: "from-emerald-400/30 to-teal-500/30" },
  { label: "Members joined", value: "267", accent: "from-cyan-400/30 to-blue-500/30" },
  { label: "Alerts sent", value: "48", accent: "from-amber-400/30 to-orange-500/30" },
];

export function StatsGrid() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
      {STAT_CARDS.map((stat, index) => (
        <Card key={stat.label} className="border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800/90 shadow-soft">
          <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
            <div className={cn("inline-flex rounded-xl sm:rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold", "bg-gradient-to-r", stat.accent)}>
              {stat.label}
            </div>
            <p className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white" style={{ animationDelay: `${index * 60}ms` }}>
              {stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
