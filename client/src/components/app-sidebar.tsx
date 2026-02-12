import { useLocation } from "wouter";
import { Filter, ListChecks, SlidersHorizontal, Menu, BarChart3, FileText } from "lucide-react";
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
