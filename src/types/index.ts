export type Page =
  | 'dashboard'
  | 'motorcycles'
  | 'motorcycle-detail'
  | 'warehouse'
  | 'parts'
  | 'suppliers'
  | 'supplier-detail'
  | 'shipments'
  | 'shipment-detail'
  | 'purchase-orders'
  | 'po-detail'
  | 'documents'
  | 'vault'
  | 'analytics'
  | 'activity'
  | 'settings'
  | 'search';

export type BikeStatus =
  | 'ordered' | 'manufacturing' | 'shipped' | 'in-transit'
  | 'customs' | 'delivered' | 'warehouse' | 'ready-for-sale'
  | 'reserved' | 'sold' | 'warranty' | 'service';

export type ShipmentStatus =
  | 'ordered' | 'processing' | 'picked-up' | 'in-transit'
  | 'customs' | 'out-for-delivery' | 'delivered' | 'delayed';

export type POStatus = 'draft' | 'sent' | 'confirmed' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit-paid' | 'partial' | 'paid' | 'overdue';
export type InventoryStatus = 'ordered' | 'in-transit' | 'at-warehouse' | 'stocked';

export interface MapPosition { warehouseId: string; x: number; y: number; }

export interface Motorcycle {
  id: string;
  bikeId: string;
  vin: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  condition: 'new' | 'used' | 'demo' | 'damaged';
  purchasePrice: number;
  currentValue: number;
  salePrice: number;
  supplierId: string;
  purchaseDate: string;
  arrivalDate?: string;
  warehouseId: string;
  warehouseLocation: string;
  status: BikeStatus;
  mileage: number;
  batteryInfo: string;
  controllerInfo: string;
  modifications: string;
  photos: string[];
  documents: string[];
  notes: string;
  mapPosition?: MapPosition;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  sku: string;
  supplierId: string;
  quantity: number;
  minimumStock: number;
  cost: number;
  retailPrice: number;
  warehouseId: string;
  location: string;
  compatibility: string[];
  photos: string[];
  supplierLink: string;
  notes: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  countryCode: string;
  address: string;
  products: string[];
  moq: number;
  shippingMethod: string;
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface ShipmentItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface Shipment {
  id: string;
  shipmentNumber: string;
  trackingNumber?: string;
  carrier: string;
  supplierId: string;
  purchaseOrderId?: string;
  items: ShipmentItem[];
  origin: string;
  destination: string;
  shippingMethod: 'air' | 'sea' | 'ground' | 'express';
  orderDate: string;
  shipDate?: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: ShipmentStatus;
  documents: string[];
  photos: string[];
  notes: string;
  createdAt: string;
}

export interface POItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  items: POItem[];
  shippingCost: number;
  taxesFees: number;
  deposit: number;
  paymentStatus: PaymentStatus;
  expectedDelivery: string;
  notes: string;
  status: POStatus;
  createdAt: string;
}

export interface VaultEntry {
  id: string;
  category: 'supplier-account' | 'shipping-account' | 'dealer-portal' | 'website' | 'software' | 'business-service' | 'social-media' | 'banking';
  service: string;
  username: string;
  passwordEncrypted: string;
  website: string;
  notes: string;
  accountOwner: string;
  lastUpdated: string;
  createdAt: string;
}

export interface GPDocument {
  id: string;
  name: string;
  type: 'commercial-invoice' | 'packing-list' | 'bill-of-lading' | 'certificate' | 'mco' | 'title' | 'purchase-order' | 'supplier-invoice' | 'shipping-doc' | 'warranty' | 'manual' | 'customs' | 'other';
  entityType: 'motorcycle' | 'supplier' | 'order' | 'shipment' | 'part' | 'general';
  entityId?: string;
  fileSize: string;
  uploadDate: string;
  notes: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  photo?: string;
  rows: number;
  cols: number;
}

export interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  user: string;
  timestamp: string;
  details?: string;
  actionType: 'added' | 'updated' | 'deleted' | 'moved' | 'shipped' | 'received' | 'status';
}

export interface AppData {
  motorcycles: Motorcycle[];
  parts: Part[];
  suppliers: Supplier[];
  shipments: Shipment[];
  purchaseOrders: PurchaseOrder[];
  vault: VaultEntry[];
  documents: GPDocument[];
  warehouses: Warehouse[];
  activity: ActivityEntry[];
}
