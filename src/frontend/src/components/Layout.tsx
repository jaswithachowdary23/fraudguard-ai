import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  History,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" as const },
  { label: "Transaction Checker", icon: Shield, to: "/checker" as const },
  { label: "History", icon: History, to: "/history" as const },
  { label: "Model Performance", icon: BarChart2, to: "/performance" as const },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { shortPrincipal, logout } = useAuth();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className="flex flex-col w-64 shrink-0 bg-card border-r border-border"
        data-ocid="sidebar"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15 border border-primary/30">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-foreground leading-tight">
              FraudGuard AI
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Detection System
            </p>
          </div>
        </div>

        <Separator />

        {/* Nav */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
          data-ocid="sidebar.nav"
        >
          <TooltipProvider delayDuration={300}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.to}
                      data-ocid={`sidebar.nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                      className={[
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth",
                        isActive
                          ? "bg-primary/15 text-primary border border-primary/25"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        <Separator />

        {/* User */}
        <div className="px-3 py-3" data-ocid="sidebar.user">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 shrink-0">
              <span className="text-xs font-bold text-primary">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {shortPrincipal ?? "Anonymous"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Internet Identity
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={logout}
              data-ocid="sidebar.logout_button"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="flex-1 overflow-y-auto bg-background"
        data-ocid="main.content"
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
