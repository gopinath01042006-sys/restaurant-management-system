import React, { useState, useEffect } from "react";
import {
  Menu as MenuIcon,
  Search,
  Bell,
  Check,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Package
} from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";

export const Header = ({ onOpenSearch, onToggleMobileSidebar, setActiveModule }) => {
  const {
    currentUser,
    switchRole,
    notifications,
    markAllNotificationsRead,
    clearNotifications,
    resetDemoData,
    settings
  } = useRestaurant();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const roles = ["Admin", "Manager", "Cashier", "Kitchen Staff", "Waiter", "Customer"];

  const handleNotificationClick = (notif) => {
    if (notif.link && setActiveModule) {
      setActiveModule(notif.link);
    }
    setShowNotifications(false);
  };

  return (
    <header className="top-header">
      {/* Left section: mobile hamburger & search */}
      <div className="header-left">
        <button
          className="icon-btn mobile-only"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation"
          style={{ display: "none" }}
        >
          <MenuIcon size={20} />
        </button>

        <div className="header-search-bar" onClick={onOpenSearch} title="Click or press Ctrl+K to search">
          <Search size={16} className="text-charcoal-400" />
          <span className="search-text">Search orders, dishes, guests...</span>
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right section: Live Time, Role Switcher, Notifications, Reset */}
      <div className="header-right">
        {/* Live operational clock */}
        <div className="header-live-time" title="Operational System Clock">
          <span className="live-pulse"></span>
          <span>
            {currentTime.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} •{" "}
            {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
          </span>
        </div>

        {/* Customer View Quick Switch Button */}
        <button
          className="btn btn-sm btn-primary"
          style={{
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
            color: "#fff",
            fontSize: "0.8rem",
            padding: "0.38rem 0.85rem",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
          onClick={() => switchRole("Customer")}
          title="Switch to Customer Food Menu & Parcel View"
        >
          <Package size={14} />
          <span>Customer View</span>
        </button>

        {/* Role Switcher Pill */}
        <div style={{ position: "relative" }}>
          <button
            className="role-switcher-dropdown"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Switch User Role to test permissions"
          >
            <ShieldCheck size={16} />
            <span>Role: <strong>{currentUser?.role || "Admin"}</strong></span>
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 200,
                background: "#fff",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--border-light)",
                padding: "0.5rem",
                zIndex: 50,
                animation: "scaleUp 180ms ease-out"
              }}
            >
              <div style={{ padding: "0.35rem 0.65rem", fontSize: "0.72rem", fontWeight: 700, color: "var(--charcoal-400)", textTransform: "uppercase" }}>
                Switch Active Role
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    fontWeight: currentUser?.role === r ? 700 : 500,
                    background: currentUser?.role === r ? "var(--primary-50)" : "transparent",
                    color: currentUser?.role === r ? "var(--primary-700)" : "var(--charcoal-700)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                >
                  <span>{r}</span>
                  {currentUser?.role === r && <Check size={16} color="var(--primary-600)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "115%",
                right: 0,
                width: 340,
                background: "#fff",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--border-light)",
                zIndex: 50,
                overflow: "hidden",
                animation: "scaleUp 180ms ease-out"
              }}
            >
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--charcoal-50)"
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  Notifications ({unreadCount} new)
                </div>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      style={{ fontSize: "0.72rem", color: "var(--primary-600)", fontWeight: 600 }}
                    >
                      Read all
                    </button>
                  )}
                  <button
                    onClick={clearNotifications}
                    style={{ fontSize: "0.72rem", color: "var(--charcoal-400)" }}
                    title="Clear all notifications"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: 320, overflowY: "auto", padding: "0.35rem 0" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--charcoal-400)", fontSize: "0.85rem" }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        background: n.unread ? "var(--primary-50)" : "#fff",
                        transition: "background 150ms"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 }}>
                        <div style={{ fontWeight: n.unread ? 700 : 600, fontSize: "0.82rem", color: "var(--charcoal-900)" }}>
                          {n.title}
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--charcoal-400)", whiteSpace: "nowrap", marginLeft: 6 }}>
                          {n.time}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "var(--charcoal-500)", lineHeight: 1.3 }}>
                        {n.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (window.confirm("Reset all RMS data back to initial authentic Indian restaurant sample state?")) {
              resetDemoData();
            }
          }}
          title="Restore pristine Indian restaurant sample dataset"
        >
          <RotateCcw size={14} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
};
