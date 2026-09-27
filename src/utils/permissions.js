// Role Based Access Control (RBAC) permissions definition

export const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "orders", label: "Orders", icon: "ShoppingBag" },
  { id: "tables", label: "Tables", icon: "Grid3X3" },
  { id: "reservations", label: "Reservations", icon: "CalendarDays" },
  { id: "menu", label: "Menu", icon: "UtensilsCrossed" },
  { id: "customers", label: "Customers", icon: "Users" },
  { id: "kitchen", label: "Kitchen (KDS)", icon: "ChefHat" },
  { id: "inventory", label: "Inventory", icon: "PackageCheck" },
  { id: "staff", label: "Staff", icon: "UserCog" },
  { id: "payments", label: "Payments", icon: "CreditCard" },
  { id: "reports", label: "Reports", icon: "BarChart3" },
  { id: "settings", label: "Settings", icon: "Settings" }
];

export const ROLE_PERMISSIONS = {
  Admin: [
    "dashboard",
    "orders",
    "tables",
    "reservations",
    "menu",
    "customers",
    "kitchen",
    "inventory",
    "staff",
    "payments",
    "reports",
    "settings"
  ],
  Manager: [
    "dashboard",
    "orders",
    "tables",
    "reservations",
    "menu",
    "customers",
    "kitchen",
    "inventory",
    "reports"
  ],
  Cashier: [
    "orders",
    "tables",
    "reservations",
    "customers",
    "payments"
  ],
  "Kitchen Staff": [
    "kitchen",
    "orders"
  ],
  Waiter: [
    "tables",
    "orders",
    "menu"
  ]
};

export const hasPermission = (role, moduleId) => {
  if (!role) return false;
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(moduleId);
};

export const getDefaultModuleForRole = (role) => {
  switch (role) {
    case "Kitchen Staff":
      return "kitchen";
    case "Cashier":
      return "orders";
    case "Waiter":
      return "tables";
    default:
      return "dashboard";
  }
};
