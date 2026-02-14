import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import { ScreenerPage } from "@/pages/ScreenerPage";
import { ChooserPage } from "@/pages/ChooserPage";
import { RangePage } from "@/pages/RangePage";
import { MenuPage } from "@/pages/MenuPage";
import { MetricMarketPage } from "@/pages/MetricMarketPage";
import { DetailCardPage } from "@/pages/DetailCardPage";
import { GoogleFinancePage } from "@/pages/GoogleFinancePage";
import { CardTypesPage } from "@/pages/CardTypesPage";
import { MetricDetailPage } from "@/pages/MetricDetailPage";
import { ChartLibraryPage } from "@/pages/ChartLibraryPage";
import { WorkbenchPage } from "@/pages/WorkbenchPage";
import { RangeBuilderPage } from "@/pages/RangeBuilderPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ScreenerPage} />
      <Route path="/chooser" component={ChooserPage} />
      <Route path="/range" component={RangePage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/metric-market" component={MetricMarketPage} />
      <Route path="/detail-card" component={DetailCardPage} />
      <Route path="/google-finance" component={GoogleFinancePage} />
      <Route path="/card-types" component={CardTypesPage} />
      <Route path="/metric-detail" component={MetricDetailPage} />
      <Route path="/chart-library" component={ChartLibraryPage} />
      <Route path="/workbench" component={WorkbenchPage} />
      <Route path="/range-builder" component={RangeBuilderPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center gap-2 p-2 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <span className="text-sm font-semibold text-[#232a31]" data-testid="text-app-title">
                  People Analytics Toolbox
                </span>
              </header>
              <main className="flex-1 overflow-auto bg-[#f5f8fa]">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
