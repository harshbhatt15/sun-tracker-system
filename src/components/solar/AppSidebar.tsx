import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BellRing,
  Cpu,
  Gauge,
  Joystick,
  LayoutDashboard,
  Settings as SettingsIcon,
  Sun,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSolar } from "@/lib/solar/useSolar";
import { StatusDot } from "./ui-bits";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Live Tracking", url: "/tracking", icon: Sun },
  { title: "Sensors", url: "/sensors", icon: Gauge },
  { title: "Energy", url: "/energy", icon: Zap },
  { title: "Manual Control", url: "/control", icon: Joystick },
  { title: "Alerts", url: "/alerts", icon: BellRing },
  { title: "System Health", url: "/health", icon: Activity },
  { title: "Architecture", url: "/architecture", icon: Cpu },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const s = useSolar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ backgroundImage: "var(--gradient-solar)" }}
          >
            <Sun className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="min-w-0 truncate font-display text-base font-bold">SunTrack Pro</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2 text-xs">
          <StatusDot level={s.emergencyStop ? "error" : s.online ? "ok" : "warn"} />
          <span className="min-w-0 truncate font-medium">
            {s.emergencyStop ? "E-STOP Engaged" : "System Online"}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
