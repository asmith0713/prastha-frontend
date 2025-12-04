"use client";

import { useMemo } from "react";
import { THREAD_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CategoryCarousel({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  const categories = useMemo(() => THREAD_CATEGORIES, []);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x snap-mandatory">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={active === category.id ? "default" : "secondary"}
          className={cn(
            "rounded-xl sm:rounded-2xl border-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium shrink-0 snap-start",
            active === category.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
          )}
          onClick={() => onSelect(category.id)}
        >
          <span className="mr-1.5 sm:mr-2 text-base sm:text-lg" aria-hidden>
            {category.icon}
          </span>
          <span className="whitespace-nowrap">{category.label.replace(/^[^\s]+\s/, "")}</span>
        </Button>
      ))}
    </div>
  );
}
