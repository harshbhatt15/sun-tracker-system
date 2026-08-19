import {
  Bell,
  KeyRound,
  Lock,
  LogOut,
  Pause,
  Play,
  Power,
  Settings,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { engine, useSolar } from "@/lib/solar/useSolar";
import { formatClock } from "@/lib/solar/types";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { StatusBadge, StatusDot } from "./ui-bits";

export function TopBar() {
  const s = useSolar();
  const { user, signOut, executeProtectedAction, openAuthModal, isAuthenticated } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Sign out failed", { description: error.message });
      return;
    }
    toast.success("Signed out successfully", {
      description: "You are now viewing the dashboard in guest view-only mode.",
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger />
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold sm:text-base">
              {s.settings.systemName}
            </div>
            <div className="hidden truncate text-[11px] text-muted-foreground sm:block">
              {s.settings.location}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-2 overflow-hidden">
          <span className="hidden font-mono text-sm tabular-nums text-solar sm:inline">
            {formatClock(s.simMinutes)}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2 py-1 text-[11px] md:inline-flex">
            <StatusDot level={s.online ? "ok" : "error"} />
            {s.settings.simulationMode ? "Simulated Link" : "ESP32 Link"}
          </span>
          <StatusBadge tone={s.night ? "info" : s.aligned ? "success" : "warning"}>
            {s.night ? "Night mode" : s.aligned ? "Sun aligned" : "Adjusting"}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden overflow-hidden rounded-full border border-border sm:flex">
            {(["auto", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() =>
                  executeProtectedAction(
                    () => engine.setMode(m),
                    `Switch Tracking to ${m.toUpperCase()} Mode`,
                  )
                }
                className={`cursor-pointer px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${s.mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              executeProtectedAction(
                () => engine.setSimulating(!s.simulating),
                s.simulating ? "Pause Simulation" : "Resume Simulation",
              )
            }
            title={s.simulating ? "Pause simulation" : "Resume simulation"}
            className="cursor-pointer"
          >
            {s.simulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Emergency Stop is ALWAYS IMMEDIATE (never blocked by auth) */}
          {s.emergencyStop ? (
            <Button
              size="sm"
              onClick={() =>
                executeProtectedAction(() => engine.resume(), "Resume System Movement")
              }
              className="gap-1.5 cursor-pointer"
            >
              <Power className="h-4 w-4" /> Resume
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => engine.emergencyStop()}
              className="gap-1.5 cursor-pointer"
              title="Immediate Emergency Stop (No auth required)"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden sm:inline">E-Stop</span>
            </Button>
          )}

          <Button asChild size="sm" variant="ghost" className="relative">
            <Link to="/alerts">
              <Bell className="h-4 w-4" />
              {s.alerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {s.alerts.length}
                </span>
              )}
            </Link>
          </Button>

          {/* User Account / Operator Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="User Account Menu"
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer ${isAuthenticated
                  ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {isAuthenticated ? (
                  <ShieldCheck className="h-4 w-4 text-solar" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 card-surface border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold leading-none text-foreground truncate">
                      {isAuthenticated
                        ? (user?.user_metadata?.["full_name"] as string | undefined) ||
                        "Authorized Operator"
                        : "Guest Observer"}
                    </p>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isAuthenticated
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-muted text-muted-foreground border-border"
                        }`}
                    >
                      {isAuthenticated ? "Authorized" : "View-Only"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-none text-muted-foreground truncate">
                    {isAuthenticated ? user?.email : "Auth required for hardware control"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {!isAuthenticated ? (
                <DropdownMenuItem
                  onClick={() => openAuthModal("Sign in to unlock manual controls and settings.")}
                  className="cursor-pointer text-primary focus:bg-primary/15 focus:text-primary flex items-center gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Sign In as Operator</span>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      <span>System Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
