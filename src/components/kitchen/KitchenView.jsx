import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { StatusBadge } from "../common/Badge";
import {
  ChefHat,
  Clock,
  AlertCircle,
  CheckCircle,
  Play,
  CheckCheck,
  Utensils,
  Package,
  Truck,
  Filter,
  Flame
} from "lucide-react";

export const KitchenView = () => {
  const { orders, updateKitchenStatus } = useRestaurant();

  const [filterChannel, setFilterChannel] = useState("all"); // all, dine-in, takeaway, delivery
  const [filterStage, setFilterStage] = useState("all"); // all, NEW, ACCEPTED, PREPARING, READY

  // Filter active kitchen orders
  const activeOrders = orders.filter((o) => {
    if (o.status === "Completed" || o.status === "Cancelled") return false;
    if (filterChannel === "dine-in" && o.type !== "Dine-in") return false;
    if (filterChannel === "takeaway" && o.type !== "Takeaway") return false;
    if (filterChannel === "delivery" && o.type !== "Delivery") return false;
    if (filterStage !== "all" && o.kitchenStatus !== filterStage) return false;
    return true;
  });

  const getChannelIcon = (type) => {
    switch (type) {
      case "Dine-in":
        return <Utensils size={14} />;
      case "Takeaway":
        return <Package size={14} />;
      case "Delivery":
        return <Truck size={14} />;
      default:
        return <Utensils size={14} />;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1 className="page-title">Kitchen Display System (KDS)</h1>
            <span className="live-pulse" style={{ width: 10, height: 10 }}></span>
          </div>
          <p className="page-subtitle">Live prep line ticket management, station queues, and dish plating workflow.</p>
        </div>
        <div className="page-actions">
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--charcoal-700)" }}>
              {activeOrders.length} Active Tickets in Queue
            </span>
          </div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "0.85rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Stage filter */}
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--charcoal-400)", textTransform: "uppercase", marginRight: 4 }}>
              Stage:
            </span>
            {[
              { id: "all", label: "All Active" },
              { id: "NEW", label: "🔴 New Tickets" },
              { id: "PREPARING", label: "🔥 Preparing" },
              { id: "READY", label: "🟢 Ready to Serve" }
            ].map((st) => (
              <button
                key={st.id}
                className={`pill-filter ${filterStage === st.id ? "active" : ""}`}
                onClick={() => setFilterStage(st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Channel filter */}
          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--charcoal-400)", textTransform: "uppercase", marginRight: 4 }}>
              Channel:
            </span>
            {["all", "dine-in", "takeaway", "delivery"].map((ch) => (
              <button
                key={ch}
                className={`pill-filter ${filterChannel === ch ? "active" : ""}`}
                onClick={() => setFilterChannel(ch)}
                style={{ textTransform: "capitalize" }}
              >
                {ch === "all" ? "All Channels" : ch}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {activeOrders.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", background: "#fff", borderRadius: "var(--radius-lg)" }}>
            <ChefHat size={48} style={{ margin: "0 auto 1rem", color: "var(--success-500)" }} />
            <h3 style={{ fontSize: "1.25rem", color: "var(--charcoal-800)" }}>Kitchen Queue is Clear!</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--charcoal-500)", marginTop: 4 }}>All incoming tickets have been plated and served.</p>
          </div>
        ) : (
          activeOrders.map((ord) => {
            const isDelayed = (ord.elapsedMinutes || 0) > 20;
            const isReady = ord.kitchenStatus === "READY";
            const isPreparing = ord.kitchenStatus === "PREPARING";
            const isNew = ord.kitchenStatus === "NEW" || ord.kitchenStatus === "ACCEPTED";

            let headerBg = "var(--charcoal-800)";
            if (isDelayed) headerBg = "var(--danger-600)";
            else if (isReady) headerBg = "var(--success-600)";
            else if (isPreparing) headerBg = "var(--primary-600)";

            return (
              <div
                key={ord.id}
                className="card"
                style={{
                  border: isDelayed ? "2px solid var(--danger-500)" : "1px solid var(--border-light)",
                  boxShadow: isDelayed ? "0 0 16px rgba(239, 68, 68, 0.2)" : "var(--shadow-xs)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden"
                }}
              >
                <div>
                  {/* Ticket Header */}
                  <div
                    style={{
                      background: headerBg,
                      color: "#fff",
                      padding: "0.75rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.02em" }}>
                        {ord.id}
                      </div>
                      <div style={{ fontSize: "0.75rem", opacity: 0.9, display: "flex", alignItems: "center", gap: 4 }}>
                        {getChannelIcon(ord.type)}
                        <span>{ord.type} {ord.tableId ? `• Table ${ord.tableId}` : ""}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          background: "rgba(0, 0, 0, 0.3)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700
                        }}
                      >
                        <Clock size={12} />
                        <span>{ord.elapsedMinutes || 5}m elapsed</span>
                      </div>
                      {isDelayed && (
                        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff", marginTop: 2, display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                          <AlertCircle size={10} /> DELAY ALERT
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer / Note banner */}
                  <div style={{ padding: "0.65rem 1rem", background: "var(--charcoal-50)", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>Guest: <strong>{ord.customerName}</strong></span>
                    <span style={{ fontWeight: 700, color: "var(--charcoal-700)" }}>
                      {ord.items.reduce((s, i) => s + i.quantity, 0)} Items
                    </span>
                  </div>

                  {/* Special instruction highlight */}
                  {ord.notes && (
                    <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "0.5rem 1rem", fontSize: "0.75rem", color: "#92400e", fontWeight: 600 }}>
                      ⚠️ <strong>Note:</strong> {ord.notes}
                    </div>
                  )}

                  {/* Items List */}
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          borderBottom: idx !== ord.items.length - 1 ? "1px dashed var(--border-subtle)" : "none",
                          paddingBottom: "0.5rem"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--charcoal-900)" }}>
                            {item.name}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: "0.72rem", color: "var(--danger-600)", fontWeight: 600, marginTop: 2 }}>
                              👉 {item.notes}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            background: "var(--charcoal-900)",
                            color: "#fff",
                            minWidth: 28,
                            height: 28,
                            borderRadius: "var(--radius-sm)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            marginLeft: 10
                          }}
                        >
                          ×{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stage Advancement Footer */}
                <div style={{ padding: "0.75rem 1rem", background: "var(--charcoal-50)", borderTop: "1px solid var(--border-light)", display: "flex", gap: "0.5rem" }}>
                  {isNew && (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => updateKitchenStatus(ord.id, "PREPARING")}
                    >
                      <Play size={14} /> Start Preparing
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={() => updateKitchenStatus(ord.id, "READY")}
                    >
                      <CheckCircle size={14} /> Mark as READY
                    </button>
                  )}

                  {isReady && (
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, borderColor: "var(--success-500)", color: "var(--success-700)" }}
                      onClick={() => updateKitchenStatus(ord.id, "SERVED")}
                    >
                      <CheckCheck size={14} /> Mark as Served / Dispatched
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
