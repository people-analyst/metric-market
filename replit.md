# People Analytics Toolbox

## Overview
A People Analytics toolbox with reusable form elements inspired by Yahoo Finance and Google Finance designs. Built with React, Express, TypeScript, and Tailwind CSS. Components are designed to be attached to different database elements. Part of a hub-and-spoke ecosystem architecture where this workbench creates reusable UI/UX components shared across spoke applications (MetricMarket, etc.).

## Recent Changes
- 2026-02-12: Added MetricMarket dashboard page (ticker cards, sparklines, screener panel, watchlist) from bundle
- 2026-02-12: Added sidebar navigation with wouter routing to toggle between component pages
- 2025-02-12: Built three reusable form components from Figma designs (StockScreenerFilters, FilterChooser, RangeInputFilter)
- 2025-02-12: Initial Figma import and migration to Replit environment

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query
- **Database**: PostgreSQL via Drizzle ORM (Neon serverless)
- **Build**: Vite for client, esbuild for server
- **Ecosystem**: Hub-and-spoke architecture; this workbench is the hub creating shared components

## Reusable Components
- **StockScreenerFilters** (`client/src/components/StockScreenerFilters.tsx`) - Interactive filter form with badge, toggle, input, and add filter types. Supports state management for add/remove/toggle operations.
- **FilterChooser** (`client/src/components/FilterChooser.tsx`) - Checkbox-based filter picker organized by categories with search.
- **RangeInputFilter** (`client/src/components/RangeInputFilter.tsx`) - Standalone range input with condition dropdown (greater than, less than, etc).
- **DetailCard** (`client/src/components/DetailCard.tsx`) - Fact-sheet card with optional tags (badges) at top, key-value rows separated by dashed borders, and optional footer with icon/score/external link. Props: tags, rows, footer.
- **OrgMetricCard** (`client/src/components/OrgMetricCard.tsx`) - Organization metric card with ticker badge, headline, big value with trend arrow, and key-value breakdown rows. Props: ticker, tickerColor, title, value, changePct, positive, source, time, rows.
- **ResearchCard** (`client/src/components/ResearchCard.tsx`) - Peer-reviewed research card with citation, tags, and statistical data rows. Props: title, source, time, citation, tags, rows, href.
- **AnalysisSummaryCard** (`client/src/components/AnalysisSummaryCard.tsx`) - Analysis summary with risk-level indicator (low/medium/high), ticker badge, and key metric rows. Props: title, source, time, ticker, tickerColor, riskLevel, rows, summary.
- **ActionPlanCard** (`client/src/components/ActionPlanCard.tsx`) - Action plan with checklist (completed/pending), progress bar, and tags. Props: title, source, time, tags, actions[], progressPct.
- **CompetitiveIntelCard** (`client/src/components/CompetitiveIntelCard.tsx`) - Competitive intelligence card with benchmark data rows, tags, and optional summary. Props: title, source, time, tags, rows, summary.

## Spoke Applications
- **Card Viewer** (`client/src/pages/MetricMarketPage.tsx`) - HR metrics dashboard with ticker cards, mini sparklines, screener panel (checkbox filter picker), and watchlist. Uses deterministic mock data generation. 6 metric categories: Workforce Composition, Compensation & Value, Popular Filters, Attrition & Movement, Performance & Development, Engagement & Culture. Sidebar label: "Card Viewer".

## Menu / Landing Page
- **Menu** (`client/src/pages/MenuPage.tsx`) - Yahoo Finance screeners landing page adapted for People Analytics. Contains 5 generalizable sections:
  1. **TickerTape** - Horizontal scrolling metric strip with sparklines and % changes
  2. **SavedScreenersSection** - Empty/auth state for saved dashboards with CTA
  3. **FeaturedCardsSection** - Horizontal scrollable preview cards with data rows (e.g. "High Flight Risk Teams", "Top Performing Departments")
  4. **CreateNewSection** - Category picker grid (Workforce, Compensation, Performance, Attrition, Engagement screeners)
  5. **PremiumSection** - Gated content cards with P+ branding and trial CTA

- **Google Finance** (`client/src/pages/GoogleFinancePage.tsx`) - Google Finance-style content-dense dashboard. Contains: market category tabs, index ticker strip with up/down arrows, watchlist prompt, suggested metrics list, sidebar cards (trends/calendar/most-followed), mixed-content feed with 5 card types (Org Metric, Peer Reviewed Research, Analysis Summary, Action Planning, Competitive Intelligence) filterable by tab, full-width metric trends with Most active/Gainers/Losers tabs, and discover-more horizontal scroll cards. All People Analytics context. Feed cards include key-value rows, risk levels, progress bars, citations, and action checklists.

- **Metric Detail** (`client/src/pages/MetricDetailPage.tsx`) - Google Finance stock detail page adapted for People Analytics. Contains: breadcrumb navigation, metric name with Follow/Share buttons, big value header with trend arrow and period change, large SVG chart with time-period tabs (1M/3M/6M/YTD/1Y/3Y/MAX), horizontal-scroll timeline event cards with source/date/headline/% change, "Metric Breakdown" section with quarterly/annual tabs, bar chart (voluntary vs involuntary), financial-style data rows with Y/Y change %, collapsible accordion sections (Retention Drivers, Exit Analysis), right sidebar fact-sheet card with tags and key-value rows, About card with description and icon-labeled facts (Owner, Tracking Since, Scope, Source, Population), "Discover more" and "People also track" horizontal scroll card rows with ticker badges.

## Chart Library Components
- **ConfidenceBandChart** (`client/src/components/charts/ConfidenceBandChart.tsx`) - Line chart with forecast confidence/uncertainty bands. Props: data (x,y,lo1,hi1,lo2,hi2)[], lineColor, bandColors, xLabel, yLabel.
- **AlluvialChart** (`client/src/components/charts/AlluvialChart.tsx`) - Flow/Sankey diagram showing how categories redistribute between two time periods. Props: flows (from,to,value)[], colors, leftLabel, rightLabel.
- **WaffleBarChart** (`client/src/components/charts/WaffleBarChart.tsx`) - Stacked bars made of countable grid cells showing composition. Props: groups (label, segments[])[], cellSize, cols, defaultColors.
- **BulletBarChart** (`client/src/components/charts/BulletBarChart.tsx`) - Horizontal bars with range backgrounds, value bar, and target marker. Props: data (label, ranges[], value, marker)[], rangeColors, valueColor, markerColor.
- **SlopeComparisonChart** (`client/src/components/charts/SlopeComparisonChart.tsx`) - Period-over-period growth with filled slope area and percentage change. Props: items (label, startValue, endValue)[], accentColor, startYear, endYear.
- **BubbleScatterChart** (`client/src/components/charts/BubbleScatterChart.tsx`) - Scatter plot with sized/colored bubbles for multi-dimensional comparison. Props: data (x,y,size,label,color)[], xLabel, yLabel, maxRadius.
- **BoxWhiskerChart** (`client/src/components/charts/BoxWhiskerChart.tsx`) - Candlestick-style box and whisker chart showing distribution spread. Props: data (label, min, q1, median, q3, max)[], boxColor, whiskerColor, medianColor.
- **StripTimelineChart** (`client/src/components/charts/StripTimelineChart.tsx`) - Horizontal strip of cells with highlighted colored blocks and counts per row. Props: rows (label, cells[])[], cellSize, gap, defaultColor.
- **WafflePercentChart** (`client/src/components/charts/WafflePercentChart.tsx`) - Single 10x10 waffle grid showing a percentage as filled cells. Props: percent, rows, cols, cellSize, filledColor, emptyColor.
- **HeatmapChart** (`client/src/components/charts/HeatmapChart.tsx`) - Color-intensity matrix for cross-dimensional comparison. Props: data (number[][]), rowLabels, colLabels, colorRange.
- **StripDotChart** (`client/src/components/charts/StripDotChart.tsx`) - Scattered colored squares across categorical rows for event positioning. Props: rows (label, events[])[], dotSize, defaultColors.
- **MultiLineChart** (`client/src/components/charts/MultiLineChart.tsx`) - Multiple time series lines with optional reference line and legend. Props: series (label, values[], color?)[], xLabels, referenceLine, yLabel.
- **TileCartogramChart** (`client/src/components/charts/TileCartogramChart.tsx`) - Geographic tile/cartogram map with color-coded squares positioned by row/col. Props: tiles (id, label, value, row, col)[], colorRange. Pre-staged geographic presets available via `TILE_PRESETS` from `tilePresets.ts`: N. America, S. America, EMEA, APAC, Regions (macro-level squares).
- **TimelineMilestoneChart** (`client/src/components/charts/TimelineMilestoneChart.tsx`) - Labeled event markers at varying heights along a horizontal time axis. Props: milestones (label, position, height, color?)[], xLabels, defaultColors.
- **ControlChart** (`client/src/components/charts/ControlChart.tsx`) - SPC control chart with UCL/LCL bands and ±σ zones. Props: data (number[]), lineColor, bandColors, xLabel, yLabel.
- **DendrogramChart** (`client/src/components/charts/DendrogramChart.tsx`) - Hierarchical clustering tree with branching structure. Props: root (DendrogramNode), lineColor, labelColor.
- **RadialBarChart** (`client/src/components/charts/RadialBarChart.tsx`) - Concentric arc bars for proportional comparison with letter indicators at arc ends and legend key below. Props: data (label, value, color?)[], maxValue, defaultColors, trackColor.
- **BumpChart** (`client/src/components/charts/BumpChart.tsx`) - Rank change visualization with crossing lines and value circles. Props: items (label, startRank, endRank, startValue, endValue)[], startYear, endYear.
- **SparklineRowsChart** (`client/src/components/charts/SparklineRowsChart.tsx`) - Labeled rows with individual sparklines for quick comparison. Props: rows (label, value, data[])[], lineColor, rowHeight.
- **StackedAreaChart** (`client/src/components/charts/StackedAreaChart.tsx`) - Layered filled areas showing composition over time. Props: series (label, values[], color?)[], xLabels, defaultColors.

## Structure
```
client/           - React frontend
  src/
    components/     - Reusable form components
      ui/           - shadcn/ui base components
      app-sidebar.tsx - Sidebar navigation
      StockScreenerFilters.tsx - Filter form (Input 1 & 3)
      FilterChooser.tsx       - Filter picker (Input 2)
      RangeInputFilter.tsx    - Range input with condition
    pages/          - Page components
      ScreenerPage.tsx   - Stock Screener Filters demo
      ChooserPage.tsx    - Filter Chooser demo
      RangePage.tsx      - Range Input demo
      MenuPage.tsx       - Menu component demo
      MetricMarketPage.tsx - MetricMarket dashboard (spoke app)
    lib/            - Utilities and query client
    hooks/          - Custom hooks
server/           - Express backend
  index.ts        - Server entry point
  routes.ts       - API routes
  storage.ts      - Data storage interface
  vite.ts         - Vite dev server integration
shared/           - Shared types/schemas
  schema.ts       - Drizzle schema definitions
```

## User Preferences
- Yahoo Finance inspired design (colors #0f69ff, #e0f0ff, #232a31, #5b636a, #e0e4e9)
- Components should be reusable form elements for People Analytics toolbox
- Elements should be attachable to different database elements
- All buttons should be refined and usable
- "P" branding instead of Yahoo "Y" icons
- Compact, minimal spacing design aesthetic (rounded-[3px], tight padding)
- Additional Yahoo and Google Finance designs to come later
