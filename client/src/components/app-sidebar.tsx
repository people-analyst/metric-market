import { useLocation } from "wouter";
import { Filter, ListChecks, SlidersHorizontal, Menu, BarChart3, FileText, TrendingUp, Layers, Target } from "lucide-react";
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

const items = [
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
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
