# Yahoo Finance Stock Screener

## Overview
A stock screener application inspired by Yahoo Finance design. Built with React, Express, TypeScript, and Tailwind CSS. The app provides a filter-based UI for screening stocks by region, market cap, sector, industry, and various financial metrics.

## Recent Changes
- 2025-02-12: Initial Figma import and migration to Replit environment

## Project Architecture
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Routing**: wouter (client-side), Express (server-side API)
- **State Management**: TanStack React Query
- **Database**: PostgreSQL via Drizzle ORM (Neon serverless)
- **Build**: Vite for client, esbuild for server

## Structure
```
client/           - React frontend
  src/
    components/ui/  - shadcn/ui components
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
- Additional Yahoo and Google Finance designs to come later