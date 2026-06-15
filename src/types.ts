/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProjectItem {
  qty: number;
  qtyYards: number;
  unit: string;
  price: number;
  per_disc: number;
  ontop: number;
  room_name: string;
  item_type: string; // 'F', 'P', 'A'
  descriptions: string;
  itemNetTotal: number;
  fabric_name?: string;
  fabric_color?: string;
  is_wide?: boolean;
  clean_desc?: string;
}

export interface Project {
  id: string; // The same as quotation_no
  quotation_no: string;
  cs_phone: string;
  sale_id: string;
  customerName: string;
  address: string;
  province: string;
  contact_name: string;
  confirm_date: string;
  discount_round: number;
  items: ProjectItem[];
  netTotal: number;
  total_F: number;
  total_P: number;
  total_A: number;
  uploadDate: number;
}

export interface FabricDetail {
  color: string;
  room: string;
  yards: number;
  qty: number;
}

export interface FabricGroup {
  name: string;
  totalYards: number;
  totalQty: number;
  details: FabricDetail[];
}

export interface CurtainDetail {
  room: string;
  qty: number;
  unit: string;
}

export interface CurtainGroup {
  name: string;
  totalQty: number;
  details: CurtainDetail[];
}

export interface BlindDetail {
  desc: string;
  room: string;
  sqm: number;
  unit: string;
}

export interface BlindGroup {
  name: string;
  totalSqm: number;
  totalSets: number;
  details: BlindDetail[];
}

export interface AccessoryDetail {
  room: string;
  qty: number;
  unit: string;
}

export interface AccessoryGroup {
  name: string;
  totalQty: number;
  unit: string;
  details: AccessoryDetail[];
}
