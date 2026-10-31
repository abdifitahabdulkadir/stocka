export const salesData = [
  { month: "Jan", revenue: 42500, orders: 312, returns: 18 },
  { month: "Feb", revenue: 38900, orders: 287, returns: 22 },
  { month: "Mar", revenue: 51200, orders: 398, returns: 15 },
  { month: "Apr", revenue: 47800, orders: 351, returns: 20 },
  { month: "May", revenue: 63100, orders: 467, returns: 25 },
  { month: "Jun", revenue: 58400, orders: 432, returns: 19 },
  { month: "Jul", revenue: 71200, orders: 521, returns: 30 },
];

export const categoryData = [
  { name: "Electronics", value: 34, color: "#ea580c" },
  { name: "Clothing", value: 22, color: "#fb923c" },
  { name: "Furniture", value: 18, color: "#f97316" },
  { name: "Tools", value: 15, color: "#10b981" },
  { name: "Other", value: 11, color: "#f59e0b" },
];

export const products = [
  { id: "PRD-001", name: "Laptop Pro 15", category: "Electronics", sku: "LP-15-2024", price: 1299.99, stock: 45, reorder: 10, status: "In Stock" },
  { id: "PRD-002", name: "Wireless Headphones", category: "Electronics", sku: "WH-BT-400", price: 189.99, stock: 8, reorder: 15, status: "Low Stock" },
  { id: "PRD-003", name: "Office Chair Ergonomic", category: "Furniture", sku: "OC-ERG-01", price: 549.00, stock: 0, reorder: 5, status: "Out of Stock" },
  { id: "PRD-004", name: "Running Shoes X3", category: "Clothing", sku: "RS-X3-42", price: 129.95, stock: 120, reorder: 20, status: "In Stock" },
  { id: "PRD-005", name: "Power Drill 18V", category: "Tools", sku: "PD-18V-PRO", price: 219.99, stock: 34, reorder: 8, status: "In Stock" },
  { id: "PRD-006", name: "Standing Desk 140cm", category: "Furniture", sku: "SD-140-WHT", price: 799.00, stock: 12, reorder: 5, status: "In Stock" },
  { id: "PRD-007", name: "Mechanical Keyboard", category: "Electronics", sku: "MK-TKL-BLU", price: 149.99, stock: 3, reorder: 10, status: "Low Stock" },
  { id: "PRD-008", name: "Yoga Mat Premium", category: "Clothing", sku: "YM-PREM-GRN", price: 79.99, stock: 67, reorder: 25, status: "In Stock" },
];

export const customers = [
  { id: "CUS-001", name: "Meridian Corp", email: "orders@meridiancorp.com", phone: "+1 (555) 210-4400", city: "San Francisco", orders: 48, spent: 94200, status: "Active" },
  { id: "CUS-002", name: "Blake & Associates", email: "blake@bkassoc.net", phone: "+1 (555) 388-1120", city: "Chicago", orders: 31, spent: 47850, status: "Active" },
  { id: "CUS-003", name: "Vertex Solutions", email: "purchasing@vertexsol.com", phone: "+1 (555) 741-9930", city: "New York", orders: 19, spent: 33100, status: "Inactive" },
  { id: "CUS-004", name: "Nova Retail Ltd", email: "nova@novaretail.co", phone: "+1 (555) 502-6750", city: "Austin", orders: 62, spent: 112400, status: "Active" },
  { id: "CUS-005", name: "Crestline Group", email: "crest@crestlinegroup.io", phone: "+1 (555) 874-3310", city: "Seattle", orders: 9, spent: 18750, status: "Active" },
  { id: "CUS-006", name: "Pinnacle Trading", email: "trade@pinnacletrd.com", phone: "+1 (555) 233-8870", city: "Miami", orders: 77, spent: 163900, status: "Active" },
];

export const suppliers = [
  { id: "SUP-001", name: "TechDistrib Global", contact: "Alan Park", email: "alan.park@techdistrib.com", country: "USA", products: 142, lead: "5 days", status: "Preferred" },
  { id: "SUP-002", name: "EuroComponents AG", contact: "Lisa Müller", email: "l.muller@eurocomp.de", country: "Germany", products: 88, lead: "14 days", status: "Active" },
  { id: "SUP-003", name: "AsiaSource Ltd", contact: "Jenny Chen", email: "jenny.chen@asiasource.hk", country: "Hong Kong", products: 310, lead: "21 days", status: "Active" },
  { id: "SUP-004", name: "FurniCraft Co.", contact: "Marcus Webb", email: "m.webb@furnicraft.com", country: "Canada", products: 56, lead: "10 days", status: "Active" },
  { id: "SUP-005", name: "RapidGear Inc.", contact: "Sofia Rossi", email: "sofia@rapidgear.it", country: "Italy", products: 29, lead: "18 days", status: "Suspended" },
];

export const recentOrders = [
  { id: "ORD-8821", customer: "Nova Retail Ltd", date: "Jul 24, 2026", items: 6, total: 3849.94, status: "Delivered" },
  { id: "ORD-8820", customer: "Meridian Corp", date: "Jul 24, 2026", items: 2, total: 1489.98, status: "Processing" },
  { id: "ORD-8819", customer: "Blake & Associates", date: "Jul 23, 2026", items: 4, total: 719.96, status: "Shipped" },
  { id: "ORD-8818", customer: "Pinnacle Trading", date: "Jul 23, 2026", items: 11, total: 8201.89, status: "Delivered" },
  { id: "ORD-8817", customer: "Crestline Group", date: "Jul 22, 2026", items: 1, total: 549.00, status: "Cancelled" },
];

export const inventoryAlerts = [
  { product: "Wireless Headphones", sku: "WH-BT-400", stock: 8, reorder: 15, supplier: "TechDistrib Global" },
  { product: "Office Chair Ergonomic", sku: "OC-ERG-01", stock: 0, reorder: 5, supplier: "FurniCraft Co." },
  { product: "Mechanical Keyboard", sku: "MK-TKL-BLU", stock: 3, reorder: 10, supplier: "TechDistrib Global" },
];
