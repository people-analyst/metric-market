# Yahoo Finance Stock Screener

## Overview
A People Analytics toolbox with reusable form elements inspired by Yahoo Finance and Google Finance designs. Built with React, Express, TypeScript, and Tailwind CSS. Components are designed to be attached to different database elements.

## Recent Changes
- 2025-02-12: Built three reusable form components from Figma designs (StockScreenerFilters, FilterChooser, RangeInputFilter)
- 2025-02-12: Initial Figma import and migration to Replit environment

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query
- **Database**: PostgreSQL via Drizzle ORM (Neon serverless)
- **Build**: Vite for client, esbuild for server

## Reusable Components
- **StockScreenerFilters** (`client/src/components/StockScreenerFilters.tsx`) - Interactive filter form with badge, toggle, input, and add filter types. Supports state management for add/remove/toggle operations. Props: filters, estimatedResults, onFiltersChange, onFindStocks, onSaveFilters, onAddFilter.
- **FilterChooser** (`client/src/components/FilterChooser.tsx`) - Checkbox-based filter picker organized by categories with search. Props: categories, onClose, onCategoriesChange.
- **RangeInputFilter** (`client/src/components/RangeInputFilter.tsx`) - Standalone range input with condition dropdown (greater than, less than, etc). Props: label, conditions, defaultCondition, value, onChange.

## Structure
```
client/           - React frontend
  src/
    components/     - Reusable form components
      ui/           - shadcn/ui base components
      StockScreenerFilters.tsx - Filter form (Input 1 & 3)
      FilterChooser.tsx       - Filter picker (Input 2)
      RangeInputFilter.tsx    - Range input with condition
    pages/          - Page components (Frame.tsx is main page)
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
- Yahoo Finance inspired design
- Components should be reusable form elements for People Analytics toolbox
- Elements should be attachable to different database elements
- All buttons should be refined and usable
- Additional Yahoo and Google Finance designs to come later