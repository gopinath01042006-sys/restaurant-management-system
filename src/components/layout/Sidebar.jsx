import React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Grid3X3,
  CalendarDays,
  UtensilsCrossed,
  Users,
  ChefHat,
  PackageCheck,
  UserCog,
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Flame
} from "lucide-react";
import { MODULES, hasPermission } from "../../utils/permissions";
import { useRestaurant } from "../../context/RestaurantContext";

const ICON_MAP = {
  LayoutDashboard,
  ShoppingBag,
  Grid3X3,
  CalendarDays,
  UtensilsCrossed,
  Users,
  ChefHat,
  PackageCheck,
  UserCog,
  CreditCard,
  BarChart3,
  Settings
};

export const Sidebar = ({ activeModule, setActiveModule, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { currentUser, orders, reservations, inventory, logoutUser, settings } = useRestaurant();

  // Role permissions
  const role = currentUser ? currentUser.role : "Admin";

  // Filter modules by role permission
  const allowedModules = MODULES.filter((mod) => hasPermission(role, mod.id));

  // Dynamic badge counts
  const activeOrdersCount = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;
  const pendingReservationsCount = reservations.filter((r) => r.status === "Pending" || r.status === "Confirmed").length;
  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStock).length;

  const getBadgeForModule = (modId) => {
    if (modId === "orders" && activeOrdersCount > 0) return activeOrdersCount;
    if (modId === "reservations" && pendingReservationsCount > 0) return pendingReservationsCount;
    if (modId === "inventory" && lowStockCount > 0) return lowStockCount;
    if (modId === "kitchen") {
      const kCount = orders.filter((o) => o.kitchenStatus === "NEW" || o.kitchenStatus === "PREPARING").length;
      return kCount > 0 ? kCount : null;
    }
    return null;
  };

  const handleNavClick = (modId) => {
    setActiveModule(modId);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <Flame size={22} />
            </div>
            {!isCollapsed && (
              <div className="brand-text">
                <span className="brand-title">BHOJAN</span>
                <span className="brand-subtitle">Operations OS</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {!isCollapsed && <div className="nav-section-label">Management Modules</div>}

          {allowedModules.map((mod) => {
            const IconComponent = ICON_MAP[mod.icon] || LayoutDashboard;
            const badge = getBadgeForModule(mod.id);
            const isActive = activeModule === mod.id;

            return (
              <button
                key={mod.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavClick(mod.id)}
                title={isCollapsed ? mod.label : ""}
              >
                <span className="nav-item-icon">
                  <IconComponent size={20} />
                </span>
                {!isCollapsed && <span className="nav-item-label">{mod.label}</span>}
                {!isCollapsed && badge && <span className="nav-item-badge">{badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Current User & Logout */}
        <div className="sidebar-footer">
          <div className="user-card" title={`${currentUser?.name} (${role})`}>
            <div className="user-avatar">{currentUser?.avatar || "AD"}</div>
            {!isCollapsed && (
              <div className="user-details" style={{ flex: 1 }}>
                <span className="user-name">{currentUser?.name || "Staff Member"}</span>
                <span className="user-role-badge">{role}</span>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={logoutUser}
                className="icon-btn"
                style={{ width: 32, height: 32, background: "transparent", borderColor: "rgba(255,255,255,0.15)", color: "#cbd5e1" }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
