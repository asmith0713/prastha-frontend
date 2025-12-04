import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, actionLabel, onAction }: { title: string; description: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="glass-panel flex flex-col items-center gap-3 p-10 text-center">
      <div className="rounded-full bg-slate-900/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
        Quiet radar
      </div>
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="max-w-md text-sm text-slate-500">{description}</p>
      <Button className="rounded-2xl" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
