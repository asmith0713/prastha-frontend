import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type DashboardShellProps = {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange?: (id: string) => void;
  children: React.ReactNode;
};

export function DashboardShell({ tabs, activeTab, onTabChange, children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-mesh-blue">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:px-0">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500 shadow-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Live campus mode
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Prastha</p>
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Threads Radar
            </h1>
          </div>
        </header>

        <Tabs value={activeTab} className="w-full" onValueChange={onTabChange}>
          <TabsList className="glass-panel flex flex-wrap gap-2 p-2 shadow-soft">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "rounded-2xl px-4 py-2 text-sm font-semibold",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-glow"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
