import { useLocation } from "wouter";
import { Filter, ListChecks, SlidersHorizontal, Menu, BarChart3, FileText, TrendingUp, Layers, Target, BarChart, Wrench, Ruler, PackageOpen, Kanban } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const adminItems = [
  {
    title: "Workbench",
    url: "/workbench",
    icon: Wrench,
  },
  {
    title: "Export",
    url: "/export",
    icon: PackageOpen,
  },
  {
    title: "Kanbai",
    url: "/kanban",
    icon: Kanban,
  },
];

const componentItems = [
  {
    title: "Menu",
    url: "/menu",
    icon: Menu,
  },
  {
    title: "Card Viewer",
    url: "/metric-market",
    icon: BarChart3,
  },
  {
    title: "Screener",
    url: "/",
    icon: Filter,
  },
  {
    title: "Filter Chooser",
    url: "/chooser",
    icon: ListChecks,
  },
  {
    title: "Range Input",
    url: "/range",
    icon: SlidersHorizontal,
  },
  {
    title: "Detail Card",
    url: "/detail-card",
    icon: FileText,
  },
  {
    title: "Card Types",
    url: "/card-types",
    icon: Layers,
  },
  {
    title: "Metric Detail",
    url: "/metric-detail",
    icon: Target,
  },
  {
    title: "Range Builder",
    url: "/range-builder",
    icon: Ruler,
  },
  {
    title: "Forecast Dashboard",
    url: "/forecast-dashboard",
    icon: TrendingUp,
  },
  {
    title: "Chart Library",
    url: "/chart-library",
    icon: BarChart,
  },
  {
    title: "Google Finance",
    url: "/google-finance",
    icon: TrendingUp,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {componentItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <a href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
