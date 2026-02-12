import { TileCartogramDatum } from "./TileCartogramChart";

export interface TilePreset {
  key: string;
  label: string;
  tiles: TileCartogramDatum[];
}

const NORTH_AMERICA: TileCartogramDatum[] = [
  { id: "CA", label: "CA", value: 72, row: 0, col: 0 },
  { id: "US", label: "US", value: 95, row: 0, col: 1 },
  { id: "MX", label: "MX", value: 48, row: 1, col: 1 },
  { id: "GT", label: "GT", value: 18, row: 2, col: 0 },
  { id: "BZ", label: "BZ", value: 6, row: 2, col: 1 },
  { id: "HN", label: "HN", value: 14, row: 2, col: 2 },
  { id: "SV", label: "SV", value: 12, row: 3, col: 0 },
  { id: "NI", label: "NI", value: 10, row: 3, col: 1 },
  { id: "CR", label: "CR", value: 16, row: 3, col: 2 },
  { id: "PA", label: "PA", value: 14, row: 4, col: 1 },
  { id: "CU", label: "CU", value: 22, row: 1, col: 3 },
  { id: "JM", label: "JM", value: 10, row: 2, col: 3 },
  { id: "HT", label: "HT", value: 8, row: 1, col: 4 },
  { id: "DO", label: "DO", value: 15, row: 2, col: 4 },
  { id: "PR", label: "PR", value: 12, row: 1, col: 5 },
  { id: "TT", label: "TT", value: 6, row: 3, col: 4 },
];

const SOUTH_AMERICA: TileCartogramDatum[] = [
  { id: "CO", label: "CO", value: 42, row: 0, col: 1 },
  { id: "VE", label: "VE", value: 30, row: 0, col: 2 },
  { id: "GY", label: "GY", value: 5, row: 0, col: 3 },
  { id: "SR", label: "SR", value: 4, row: 0, col: 4 },
  { id: "EC", label: "EC", value: 22, row: 1, col: 0 },
  { id: "PE", label: "PE", value: 35, row: 2, col: 0 },
  { id: "BR", label: "BR", value: 90, row: 1, col: 2 },
  { id: "BO", label: "BO", value: 15, row: 2, col: 1 },
  { id: "PY", label: "PY", value: 10, row: 3, col: 1 },
  { id: "UY", label: "UY", value: 12, row: 3, col: 3 },
  { id: "CL", label: "CL", value: 28, row: 3, col: 0 },
  { id: "AR", label: "AR", value: 45, row: 3, col: 2 },
];

const EMEA: TileCartogramDatum[] = [
  { id: "GB", label: "GB", value: 78, row: 0, col: 0 },
  { id: "IE", label: "IE", value: 18, row: 1, col: 0 },
  { id: "FR", label: "FR", value: 65, row: 1, col: 1 },
  { id: "DE", label: "DE", value: 82, row: 0, col: 2 },
  { id: "NL", label: "NL", value: 40, row: 0, col: 1 },
  { id: "BE", label: "BE", value: 22, row: 1, col: 2 },
  { id: "CH", label: "CH", value: 30, row: 2, col: 1 },
  { id: "AT", label: "AT", value: 20, row: 2, col: 2 },
  { id: "IT", label: "IT", value: 55, row: 2, col: 3 },
  { id: "ES", label: "ES", value: 48, row: 3, col: 0 },
  { id: "PT", label: "PT", value: 18, row: 3, col: 1 },
  { id: "SE", label: "SE", value: 28, row: 0, col: 4 },
  { id: "NO", label: "NO", value: 22, row: 0, col: 3 },
  { id: "DK", label: "DK", value: 20, row: 1, col: 3 },
  { id: "FI", label: "FI", value: 16, row: 0, col: 5 },
  { id: "PL", label: "PL", value: 38, row: 1, col: 4 },
  { id: "CZ", label: "CZ", value: 18, row: 1, col: 5 },
  { id: "RO", label: "RO", value: 14, row: 2, col: 5 },
  { id: "GR", label: "GR", value: 16, row: 3, col: 4 },
  { id: "TR", label: "TR", value: 52, row: 3, col: 5 },
  { id: "IL", label: "IL", value: 28, row: 4, col: 5 },
  { id: "AE", label: "AE", value: 42, row: 5, col: 5 },
  { id: "SA", label: "SA", value: 35, row: 5, col: 4 },
  { id: "EG", label: "EG", value: 30, row: 4, col: 3 },
  { id: "NG", label: "NG", value: 25, row: 5, col: 2 },
  { id: "KE", label: "KE", value: 18, row: 5, col: 3 },
  { id: "ZA", label: "ZA", value: 32, row: 6, col: 2 },
  { id: "GH", label: "GH", value: 12, row: 5, col: 1 },
  { id: "MA", label: "MA", value: 14, row: 4, col: 0 },
];

const APAC: TileCartogramDatum[] = [
  { id: "CN", label: "CN", value: 90, row: 1, col: 1 },
  { id: "JP", label: "JP", value: 78, row: 0, col: 3 },
  { id: "KR", label: "KR", value: 55, row: 0, col: 2 },
  { id: "IN", label: "IN", value: 85, row: 2, col: 0 },
  { id: "AU", label: "AU", value: 52, row: 4, col: 3 },
  { id: "NZ", label: "NZ", value: 18, row: 5, col: 4 },
  { id: "SG", label: "SG", value: 35, row: 3, col: 2 },
  { id: "MY", label: "MY", value: 28, row: 3, col: 1 },
  { id: "TH", label: "TH", value: 30, row: 2, col: 1 },
  { id: "VN", label: "VN", value: 22, row: 2, col: 2 },
  { id: "ID", label: "ID", value: 42, row: 4, col: 1 },
  { id: "PH", label: "PH", value: 25, row: 2, col: 3 },
  { id: "TW", label: "TW", value: 32, row: 1, col: 3 },
  { id: "HK", label: "HK", value: 28, row: 1, col: 2 },
  { id: "PK", label: "PK", value: 20, row: 1, col: 0 },
  { id: "BD", label: "BD", value: 15, row: 2, col: 4 },
  { id: "MM", label: "MM", value: 10, row: 3, col: 0 },
  { id: "KH", label: "KH", value: 8, row: 3, col: 3 },
];

const REGIONS: TileCartogramDatum[] = [
  { id: "NA", label: "NA", value: 82, row: 0, col: 0 },
  { id: "LATAM", label: "LATAM", value: 45, row: 1, col: 0 },
  { id: "EMEA", label: "EMEA", value: 68, row: 0, col: 1 },
  { id: "APAC", label: "APAC", value: 72, row: 0, col: 2 },
];

export const TILE_PRESETS: TilePreset[] = [
  { key: "na", label: "N. America", tiles: NORTH_AMERICA },
  { key: "sa", label: "S. America", tiles: SOUTH_AMERICA },
  { key: "emea", label: "EMEA", tiles: EMEA },
  { key: "apac", label: "APAC", tiles: APAC },
  { key: "regions", label: "Regions", tiles: REGIONS },
];
