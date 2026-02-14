import { TileCartogramDatum } from "./TileCartogramChart";

export interface TilePreset {
  key: string;
  label: string;
  tiles: TileCartogramDatum[];
  sectionLabels?: Record<number, string>;
}

const NORTH_AMERICA: TilePreset = {
  key: "na",
  label: "N. America",
  sectionLabels: { 0: "North", 2: "Central America", 4: "Caribbean" },
  tiles: [
    { id: "CA", label: "CA", value: 72, row: 0, col: 0 },
    { id: "US", label: "US", value: 95, row: 0, col: 1 },
    { id: "MX", label: "MX", value: 48, row: 0, col: 2 },

    { id: "GT", label: "GT", value: 18, row: 2, col: 0 },
    { id: "BZ", label: "BZ", value: 6, row: 2, col: 1 },
    { id: "SV", label: "SV", value: 12, row: 2, col: 2 },
    { id: "HN", label: "HN", value: 14, row: 2, col: 3 },
    { id: "NI", label: "NI", value: 10, row: 3, col: 0 },
    { id: "CR", label: "CR", value: 16, row: 3, col: 1 },
    { id: "PA", label: "PA", value: 14, row: 3, col: 2 },

    { id: "CU", label: "CU", value: 22, row: 4, col: 0 },
    { id: "JM", label: "JM", value: 10, row: 4, col: 1 },
    { id: "HT", label: "HT", value: 8, row: 4, col: 2 },
    { id: "DO", label: "DO", value: 15, row: 4, col: 3 },
    { id: "PR", label: "PR", value: 12, row: 5, col: 0 },
    { id: "TT", label: "TT", value: 6, row: 5, col: 1 },
  ],
};

const SOUTH_AMERICA: TilePreset = {
  key: "sa",
  label: "S. America",
  sectionLabels: { 0: "Andean", 2: "Southern Cone", 4: "Atlantic" },
  tiles: [
    { id: "CO", label: "CO", value: 42, row: 0, col: 0 },
    { id: "VE", label: "VE", value: 30, row: 0, col: 1 },
    { id: "EC", label: "EC", value: 22, row: 0, col: 2 },
    { id: "PE", label: "PE", value: 35, row: 1, col: 0 },
    { id: "BO", label: "BO", value: 15, row: 1, col: 1 },

    { id: "CL", label: "CL", value: 28, row: 2, col: 0 },
    { id: "AR", label: "AR", value: 45, row: 2, col: 1 },
    { id: "UY", label: "UY", value: 12, row: 2, col: 2 },
    { id: "PY", label: "PY", value: 10, row: 3, col: 0 },

    { id: "BR", label: "BR", value: 90, row: 4, col: 0 },
    { id: "GY", label: "GY", value: 5, row: 4, col: 1 },
    { id: "SR", label: "SR", value: 4, row: 4, col: 2 },
  ],
};

const EMEA: TilePreset = {
  key: "emea",
  label: "EMEA",
  sectionLabels: { 0: "Western Europe", 2: "Northern Europe", 4: "Eastern Europe", 6: "Middle East", 8: "Africa" },
  tiles: [
    { id: "GB", label: "GB", value: 78, row: 0, col: 0 },
    { id: "IE", label: "IE", value: 18, row: 0, col: 1 },
    { id: "FR", label: "FR", value: 65, row: 0, col: 2 },
    { id: "DE", label: "DE", value: 82, row: 0, col: 3 },
    { id: "NL", label: "NL", value: 40, row: 1, col: 0 },
    { id: "BE", label: "BE", value: 22, row: 1, col: 1 },
    { id: "CH", label: "CH", value: 30, row: 1, col: 2 },
    { id: "AT", label: "AT", value: 20, row: 1, col: 3 },
    { id: "IT", label: "IT", value: 55, row: 1, col: 4 },
    { id: "ES", label: "ES", value: 48, row: 1, col: 5 },
    { id: "PT", label: "PT", value: 18, row: 1, col: 6 },

    { id: "SE", label: "SE", value: 28, row: 2, col: 0 },
    { id: "NO", label: "NO", value: 22, row: 2, col: 1 },
    { id: "DK", label: "DK", value: 20, row: 2, col: 2 },
    { id: "FI", label: "FI", value: 16, row: 2, col: 3 },

    { id: "PL", label: "PL", value: 38, row: 4, col: 0 },
    { id: "CZ", label: "CZ", value: 18, row: 4, col: 1 },
    { id: "RO", label: "RO", value: 14, row: 4, col: 2 },
    { id: "GR", label: "GR", value: 16, row: 4, col: 3 },
    { id: "TR", label: "TR", value: 52, row: 4, col: 4 },

    { id: "IL", label: "IL", value: 28, row: 6, col: 0 },
    { id: "AE", label: "AE", value: 42, row: 6, col: 1 },
    { id: "SA", label: "SA", value: 35, row: 6, col: 2 },

    { id: "ZA", label: "ZA", value: 32, row: 8, col: 0 },
    { id: "NG", label: "NG", value: 25, row: 8, col: 1 },
    { id: "KE", label: "KE", value: 18, row: 8, col: 2 },
    { id: "EG", label: "EG", value: 30, row: 8, col: 3 },
    { id: "GH", label: "GH", value: 12, row: 8, col: 4 },
    { id: "MA", label: "MA", value: 14, row: 8, col: 5 },
  ],
};

const APAC: TilePreset = {
  key: "apac",
  label: "APAC",
  sectionLabels: { 0: "East Asia", 2: "Southeast Asia", 4: "South Asia", 6: "Oceania" },
  tiles: [
    { id: "CN", label: "CN", value: 90, row: 0, col: 0 },
    { id: "JP", label: "JP", value: 78, row: 0, col: 1 },
    { id: "KR", label: "KR", value: 55, row: 0, col: 2 },
    { id: "TW", label: "TW", value: 32, row: 0, col: 3 },
    { id: "HK", label: "HK", value: 28, row: 0, col: 4 },

    { id: "SG", label: "SG", value: 35, row: 2, col: 0 },
    { id: "MY", label: "MY", value: 28, row: 2, col: 1 },
    { id: "TH", label: "TH", value: 30, row: 2, col: 2 },
    { id: "VN", label: "VN", value: 22, row: 2, col: 3 },
    { id: "ID", label: "ID", value: 42, row: 2, col: 4 },
    { id: "PH", label: "PH", value: 25, row: 3, col: 0 },
    { id: "MM", label: "MM", value: 10, row: 3, col: 1 },
    { id: "KH", label: "KH", value: 8, row: 3, col: 2 },

    { id: "IN", label: "IN", value: 85, row: 4, col: 0 },
    { id: "PK", label: "PK", value: 20, row: 4, col: 1 },
    { id: "BD", label: "BD", value: 15, row: 4, col: 2 },

    { id: "AU", label: "AU", value: 52, row: 6, col: 0 },
    { id: "NZ", label: "NZ", value: 18, row: 6, col: 1 },
  ],
};

const US_STATES: TilePreset = {
  key: "us_states",
  label: "US States",
  tiles: [
    { id: "AK", label: "AK", value: 10, row: 0, col: 0 },
    { id: "ME", label: "ME", value: 15, row: 0, col: 10 },
    { id: "WI", label: "WI", value: 40, row: 1, col: 5 },
    { id: "VT", label: "VT", value: 8, row: 1, col: 9 },
    { id: "NH", label: "NH", value: 12, row: 1, col: 10 },
    { id: "WA", label: "WA", value: 50, row: 2, col: 0 },
    { id: "MT", label: "MT", value: 10, row: 2, col: 1 },
    { id: "ND", label: "ND", value: 8, row: 2, col: 2 },
    { id: "MN", label: "MN", value: 35, row: 2, col: 3 },
    { id: "MI", label: "MI", value: 55, row: 2, col: 6 },
    { id: "NY", label: "NY", value: 90, row: 2, col: 8 },
    { id: "MA", label: "MA", value: 45, row: 2, col: 9 },
    { id: "CT", label: "CT", value: 25, row: 2, col: 10 },
    { id: "OR", label: "OR", value: 30, row: 3, col: 0 },
    { id: "ID", label: "ID", value: 15, row: 3, col: 1 },
    { id: "SD", label: "SD", value: 8, row: 3, col: 2 },
    { id: "IA", label: "IA", value: 20, row: 3, col: 3 },
    { id: "IL", label: "IL", value: 65, row: 3, col: 5 },
    { id: "IN", label: "IN", value: 35, row: 3, col: 6 },
    { id: "OH", label: "OH", value: 55, row: 3, col: 7 },
    { id: "PA", label: "PA", value: 70, row: 3, col: 8 },
    { id: "NJ", label: "NJ", value: 50, row: 3, col: 9 },
    { id: "RI", label: "RI", value: 10, row: 3, col: 10 },
    { id: "CA", label: "CA", value: 95, row: 4, col: 0 },
    { id: "NV", label: "NV", value: 20, row: 4, col: 1 },
    { id: "WY", label: "WY", value: 6, row: 4, col: 2 },
    { id: "NE", label: "NE", value: 12, row: 4, col: 3 },
    { id: "MO", label: "MO", value: 35, row: 4, col: 4 },
    { id: "KY", label: "KY", value: 25, row: 4, col: 6 },
    { id: "WV", label: "WV", value: 12, row: 4, col: 7 },
    { id: "VA", label: "VA", value: 50, row: 4, col: 8 },
    { id: "MD", label: "MD", value: 35, row: 4, col: 9 },
    { id: "DE", label: "DE", value: 10, row: 4, col: 10 },
    { id: "UT", label: "UT", value: 20, row: 5, col: 1 },
    { id: "CO", label: "CO", value: 40, row: 5, col: 2 },
    { id: "KS", label: "KS", value: 18, row: 5, col: 3 },
    { id: "AR", label: "AR", value: 18, row: 5, col: 4 },
    { id: "TN", label: "TN", value: 40, row: 5, col: 5 },
    { id: "NC", label: "NC", value: 55, row: 5, col: 7 },
    { id: "SC", label: "SC", value: 28, row: 5, col: 8 },
    { id: "DC", label: "DC", value: 30, row: 5, col: 9 },
    { id: "AZ", label: "AZ", value: 45, row: 6, col: 1 },
    { id: "NM", label: "NM", value: 14, row: 6, col: 2 },
    { id: "OK", label: "OK", value: 22, row: 6, col: 3 },
    { id: "LA", label: "LA", value: 28, row: 6, col: 4 },
    { id: "MS", label: "MS", value: 16, row: 6, col: 5 },
    { id: "AL", label: "AL", value: 28, row: 6, col: 6 },
    { id: "GA", label: "GA", value: 60, row: 6, col: 7 },
    { id: "FL", label: "FL", value: 75, row: 6, col: 8 },
    { id: "HI", label: "HI", value: 12, row: 7, col: 0 },
    { id: "TX", label: "TX", value: 85, row: 7, col: 3 },
  ],
};

const REGIONS: TilePreset = {
  key: "regions",
  label: "Regions",
  tiles: [
    { id: "NA", label: "NA", value: 82, row: 0, col: 0 },
    { id: "LATAM", label: "LATAM", value: 45, row: 0, col: 1 },
    { id: "EMEA", label: "EMEA", value: 68, row: 0, col: 2 },
    { id: "APAC", label: "APAC", value: 72, row: 0, col: 3 },
  ],
};

export const TILE_PRESETS: TilePreset[] = [
  US_STATES,
  NORTH_AMERICA,
  SOUTH_AMERICA,
  EMEA,
  APAC,
  REGIONS,
];
