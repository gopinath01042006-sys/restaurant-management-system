import React from "react";
import { LayoutDashboard, ShoppingBag, Grid3X3, ChefHat, UtensilsCrossed } from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";
import { hasPermission } from "../../utils/permissions";

export const MobileNav = ({ activeModule, setActiveModule }) => {
  const { currentUser, orders } = useRestaurant();
  const role = currentUser ? currentUser.role : "Admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "tables", label: "Tables", icon: Grid3X3 },
    { id: "kitchen", label: "Kitchen", icon: ChefHat },
    { id: "menu", label: "Menu", icon: UtensilsCrossed }
  ].filter((item) => hasPermission(role, item.id));

  const activeOrdersCount = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;
        return (
          <button
            key={item.id}
            className={`mobile-nav-btn ${isActive ? "active" : ""}`}
            onClick={() => setActiveModule(item.id)}
          >
            <div style={{ position: "relative" }}>
              <Icon size={20} />
              {item.id === "orders" && activeOrdersCount > 0 && (
                <span className="badge-dot" style={{ top: -4, right: -8 }}>
                  {activeOrdersCount}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
