export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  serialNo: string;
  status: "active" | "under_maintenance" | "retired" | "lost";
  quantity: number;
  minStock: number;
  lowStock: boolean;
  purchaseDate: string | null;
  purchaseValue: number;
  vendor: string;
  warrantyExpiry: string | null;
  assignedToType: "none" | "room" | "staff";
  assignedToId: string | null;
  assignedToName: string;
  location: string;
  notes: string;
  qrValue: string;
  maintenance?: MaintenanceLog[];
}
export interface MaintenanceLog {
  id: string;
  assetId: string;
  type: "repair" | "service" | "inspection";
  date: string;
  cost: number;
  description: string;
  performedBy: string;
  nextDueDate: string | null;
}
export interface InventoryAnalytics {
  totalAssets: number;
  totalValue: number;
  underMaintenance: number;
  warrantyExpiring: number;
  lowStock: number;
  maintenanceCost: number;
  byCategory: { category: string; count: number; value: number }[];
}
export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}

export const ASSET_CATEGORIES = [
  "IT Equipment",
  "Classroom Assets",
  "Laboratory Equipment",
  "Office Inventory",
  "Furniture",
  "Other",
];
