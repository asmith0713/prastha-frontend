"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles } from "lucide-react";
import Image from "next/image";

const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

type Mode = "login" | "register";

export function LoginGate({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>("login");
  const { user, setUser, status } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    const result = mode === "login" ? await authAPI.login(values) : await authAPI.register(values);
    setUser(result.user, result.token);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      <Image src="/together.jpg" alt="Threads" fill className="object-cover opacity-30" priority />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-indigo-900/60" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-white/10 bg-white/10 text-white shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl">
          <CardContent className="grid gap-8 p-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em]">
                <Sparkles className="h-4 w-4" /> Prastha labs
              </div>
              <h2 className="text-3xl font-semibold leading-tight">Hyperlocal pop-up communities</h2>
              <p className="text-sm text-white/80">
                Create threads, gate access, send alerts, and let conversations expire gracefully. Built for college fests.
              </p>
            </div>
            <div className="rounded-3xl bg-white/95 p-6 text-slate-900 shadow-2xl">
              <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
                <TabsList className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                  {(
                    [
                      { id: "login", label: "Sign In" },
                      { id: "register", label: "Create account" },
                    ] as const
                  ).map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="rounded-2xl text-sm font-semibold">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="login" className="pt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Username</label>
                      <Input {...register("username")} className="mt-1 rounded-2xl" placeholder="campus lead" />
                      {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Password</label>
                      <Input type="password" {...register("password")} className="mt-1 rounded-2xl" />
                      {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-2xl" disabled={isSubmitting}>
                      {isSubmitting ? "Verifying..." : "Sign in"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register" className="pt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Username</label>
                      <Input {...register("username")} className="mt-1 rounded-2xl" placeholder="multiverse host" />
                      {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Password</label>
                      <Input type="password" {...register("password")} className="mt-1 rounded-2xl" />
                      {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                    <Button type="submit" className="w-full rounded-2xl" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
