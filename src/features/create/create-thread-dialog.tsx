"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { THREAD_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className, ...props }) => {
  return (
    <label {...props} className={cn("block text-sm font-medium text-slate-700 dark:text-slate-300", className)}>
      {children}
    </label>
  );
};

const schema = z.object({
  title: z.string().min(3, "Give your thread a name"),
  description: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length === 0 || value.length >= 20, {
      message: "Share at least 20 characters or leave it blank",
    }),
  location: z.string().min(2, "Where is this happening?"),
  category: z.string().min(1, "Select a category"),
  tags: z.string().optional(),
  durationHours: z.enum(["1", "2", "4", "8"]),
});

export type CreateThreadFormValues = z.infer<typeof schema>;

export type CreateThreadDialogProps = {
  open: boolean;
  defaultCategory?: string;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateThreadFormValues) => Promise<void> | void;
};

const durationOptions: Array<{ id: CreateThreadFormValues["durationHours"]; label: string }> = [
  { id: "1", label: "1 hour" },
  { id: "2", label: "2 hours" },
  { id: "4", label: "4 hours" },
  { id: "8", label: "8 hours" },
];

const categoryOptions = THREAD_CATEGORIES.filter((cat) => cat.id !== "all");

export function CreateThreadDialog({ open, defaultCategory, isSubmitting, onOpenChange, onSubmit }: CreateThreadDialogProps) {
  const baseCategory = React.useMemo(
    () => (defaultCategory && defaultCategory !== "all" ? defaultCategory : "other"),
    [defaultCategory],
  );
  const [categorySelection, setCategorySelection] = React.useState(baseCategory);
  const [durationSelection, setDurationSelection] = React.useState<CreateThreadFormValues["durationHours"]>("2");

  const form = useForm<CreateThreadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      tags: "",
      category: baseCategory,
      durationHours: "2",
    },
  });

  React.useEffect(() => {
    if (open) {
      setCategorySelection(baseCategory);
      form.setValue("category", baseCategory);
    }
  }, [open, baseCategory, form]);

  React.useEffect(() => {
    if (!open) {
      setCategorySelection(baseCategory);
    }
  }, [baseCategory, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    form.reset({
      title: "",
      description: "",
      location: "",
      tags: "",
      category: baseCategory,
      durationHours: "2",
    });
    setCategorySelection(baseCategory);
    setDurationSelection("2");
  });

  const handleCategoryChange = (value: string) => {
    setCategorySelection(value);
    form.setValue("category", value);
  };

  const handleDurationChange = (value: CreateThreadFormValues["durationHours"]) => {
    setDurationSelection(value);
    form.setValue("durationHours", value, { shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-full rounded-2xl sm:rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 sm:space-y-2 text-left">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100">Launch a fresh thread</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Set the vibe, pick a location, and decide how long the conversation stays live.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Sunset rooftop jam" {...form.register("title")} className="rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 h-10 sm:h-11 text-sm" />
            {form.formState.errors.title && <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="What should people know before they join?"
              {...form.register("description")}
              className="rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional, but helpful context boosts engagement.
            </p>
            {form.formState.errors.description && <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Design studio, block B" {...form.register("location")} className="rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700" />
            {form.formState.errors.location && <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.location.message}</p>}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <Label>Category</Label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={cn(
                    "rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all",
                    categorySelection === category.id
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  )}
                >
                  <span className="mr-1" aria-hidden>
                    {category.icon}
                  </span>
                  {category.label.replace(/^[^\s]+\s/, "")}
                </button>
              ))}
            </div>
            {form.formState.errors.category && <p className="text-sm text-red-500 dark:text-red-400">{form.formState.errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="Comma separated vibe tags" {...form.register("tags")} className="rounded-2xl bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Example: open-mic, beginner-friendly, chill</p>
          </div>

          <div className="space-y-3">
            <Label>Duration</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {durationOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleDurationChange(option.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
                    durationSelection === option.id
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2 sm:justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">Threads auto-expire when the timer ends. You can extend them from the admin panel.</p>
            <Button type="submit" className="rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? "Launching..." : "Create thread"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
