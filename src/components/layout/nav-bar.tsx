"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Shield, SunMedium, Moon, Bell, Home, Compass, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as React from "react";

export function NavBar({ onAdminClick }: { onAdminClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const initials = user?.username.slice(0, 2).toUpperCase();
  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop/Tablet Navigation */}
      <div className="sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 lg:px-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="glass-panel flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl shadow-soft overflow-hidden">
              <Image src="/logo.jpg" alt="Prastha" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl object-cover" priority />
            </div>
            <div className="hidden xs:block">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-slate-500">Prastha</p>
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Live Threads</p>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <div className="hidden items-center gap-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/60 p-1 text-sm font-semibold shadow-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-2xl px-4 py-1.5 transition-all",
                  pathname === link.href
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl sm:rounded-2xl" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-xl sm:rounded-2xl" asChild>
              <Link href="/alerts">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Link>
            </Button>

            {user?.isAdmin && (
              <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-xl sm:rounded-2xl" onClick={onAdminClick}>
                <Shield className="h-4 w-4" />
                <span className="sr-only">Admin</span>
              </Button>
            )}

            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-xl sm:rounded-2xl" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Logout</span>
            </Button>

            <Link href="/profile" className="rounded-full hidden sm:block">
              <Avatar className={cn("h-9 w-9 sm:h-10 sm:w-10 border-2 border-primary/40 shadow-soft")}>
                <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.username ?? "user"}`} alt={user?.username} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/40">
                        <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.username ?? "user"}`} alt={user?.username} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{user?.username ?? "Guest"}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">@{user?.username?.toLowerCase() ?? "guest"}</p>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 p-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all",
                            pathname === link.href
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <Button variant="outline" className="w-full rounded-xl justify-start gap-3" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl md:hidden safe-area-pb">
        <nav className="flex items-center justify-around px-2 py-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px]",
                  isActive
                    ? "text-primary"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
