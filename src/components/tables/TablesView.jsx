import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { StatusBadge } from "../common/Badge";
import { TableModal } from "./TableModal";
import { MoveTableModal } from "./MoveTableModal";
import { Plus, Users, Utensils, MoveRight, Trash2, Edit2, Sparkles, Clock, CheckCircle } from "lucide-react";

export const TablesView = ({ onOpenCreateOrder, onSelectOrder }) => {
  const { tables, orders, updateTableStatus, deleteTable } = useRestaurant();

  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [moveModalTableId, setMoveModalTableId] = useState(null);

  // Filter tables
  const filteredTables = tables.filter((t) => {
    if (sectionFilter !== "all" && t.section !== sectionFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  const availableCount = tables.filter((t) => t.status === "Available").length;
  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const reservedCount = tables.filter((t) => t.status === "Reserved").length;
  const cleaningCount = tables.filter((t) => t.status === "Cleaning").length;

  const handleTableClick = (table) => {
    if (table.status === "Occupied" && table.currentOrderId) {
      const order = orders.find((o) => o.id === table.currentOrderId);
      if (order && onSelectOrder) {
        onSelectOrder(order);
      }
    } else if (table.status === "Available") {
      onOpenCreateOrder(table.id);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Dining Floor & Tables</h1>
          <p className="page-subtitle">Real-time floor layout, table reservations, occupancies, and turnover management.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Table
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem"
        }}
      >
        <div className="card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--charcoal-600)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>TOTAL CAPACITY</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{tables.reduce((s, t) => s + t.capacity, 0)} Seats</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>{tables.length} Total Tables</div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--success-500)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--success-700)", fontWeight: 700 }}>AVAILABLE</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--success-600)" }}>{availableCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Ready for seating</div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #3b82f6" }}>
          <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 700 }}>OCCUPIED</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}>{occupiedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Currently dining</div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--purple-500)" }}>
          <div style={{ fontSize: "0.75rem", color: "#6d28d9", fontWeight: 700 }}>RESERVED</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--purple-500)" }}>{reservedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Upcoming booking</div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--warning-500)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--warning-600)", fontWeight: 700 }}>CLEANING</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--warning-500)" }}>{cleaningCount}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Busing / sanitizing</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "0.85rem 1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Section filter */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--charcoal-400)", textTransform: "uppercase", marginRight: 4 }}>
              Section:
            </span>
            {["all", "Main Hall", "Family AC", "Terrace Garden", "Bar & Lounge"].map((sec) => (
              <button
                key={sec}
                className={`pill-filter ${sectionFilter === sec ? "active" : ""}`}
                onClick={() => setSectionFilter(sec)}
              >
                {sec === "all" ? "All Sections" : sec}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--charcoal-400)", textTransform: "uppercase", marginRight: 4 }}>
              Status:
            </span>
            {["all", "Available", "Occupied", "Reserved", "Cleaning"].map((st) => (
              <button
                key={st}
                className={`pill-filter ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floor Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {filteredTables.map((table) => {
          const isOccupied = table.status === "Occupied";
          const isAvailable = table.status === "Available";
          const isReserved = table.status === "Reserved";
          const isCleaning = table.status === "Cleaning";

          let borderHighlight = "var(--border-light)";
          if (isAvailable) borderHighlight = "#10b981";
          if (isOccupied) borderHighlight = "#3b82f6";
          if (isReserved) borderHighlight = "#8b5cf6";
          if (isCleaning) borderHighlight = "#f59e0b";

          return (
            <div
              key={table.id}
              className="card"
              style={{
                borderTop: `4px solid ${borderHighlight}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.1rem"
              }}
            >
              <div>
                {/* Card Header: Table Number & Status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                  <div>
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
                      Table {table.number}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", marginLeft: 6 }}>
                      ({table.section})
                    </span>
                  </div>
                  <StatusBadge status={table.status} />
                </div>

                {/* Capacity & Seated detail */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--charcoal-600)", marginBottom: "0.85rem" }}>
                  <Users size={15} />
                  <span>Capacity: <strong>{table.capacity} Guests</strong></span>
                </div>

                {/* State specific info */}
                {isOccupied && (
                  <div style={{ background: "var(--charcoal-50)", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "0.85rem", border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Customer</span>
                      <strong style={{ fontSize: "0.85rem" }}>{table.customerName}</strong>
                    </div>
                    {table.currentOrderId && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Order Ref</span>
                        <strong style={{ fontSize: "0.85rem", color: "var(--primary-600)" }}>{table.currentOrderId}</strong>
                      </div>
                    )}
                    {table.seatedTime && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Seated</span>
                        <span style={{ fontSize: "0.78rem", color: "var(--charcoal-600)" }}>{table.seatedTime}</span>
                      </div>
                    )}
                  </div>
                )}

                {isReserved && (
                  <div style={{ background: "#faf5ff", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "0.85rem", border: "1px solid #ddd6fe" }}>
                    <div style={{ fontSize: "0.75rem", color: "#6d28d9", fontWeight: 700 }}>RESERVED FOR</div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--charcoal-900)" }}>{table.customerName || "Upcoming Guest"}</div>
                  </div>
                )}

                {isCleaning && (
                  <div style={{ background: "#fffbeb", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "0.85rem", border: "1px solid #fde68a" }}>
                    <div style={{ fontSize: "0.78rem", color: "#b45309", fontWeight: 600 }}>
                      Table requires busing & surface sanitization before next guest.
                    </div>
                  </div>
                )}

                {isAvailable && (
                  <div style={{ background: "#ecfdf5", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "0.85rem", border: "1px solid #a7f3d0" }}>
                    <div style={{ fontSize: "0.8rem", color: "#047857", fontWeight: 600 }}>
                      Cleaned and ready for guest seating.
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                {isAvailable && (
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => onOpenCreateOrder(table.id)}
                  >
                    <Utensils size={14} /> Seat & Order
                  </button>
                )}

                {isOccupied && (
                  <>
                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ flex: 1 }}
                      onClick={() => handleTableClick(table)}
                    >
                      View Order
                    </button>
                    <button
                      className="icon-btn"
                      style={{ width: 32, height: 32 }}
                      onClick={() => setMoveModalTableId(table.id)}
                      title="Transfer order to another table"
                    >
                      <MoveRight size={14} />
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => updateTableStatus(table.id, "Cleaning")}
                      title="Clear table"
                    >
                      Clear
                    </button>
                  </>
                )}

                {isCleaning && (
                  <button
                    className="btn btn-sm btn-success"
                    style={{ flex: 1 }}
                    onClick={() => updateTableStatus(table.id, "Available")}
                  >
                    <CheckCircle size={14} /> Mark as Ready
                  </button>
                )}

                {isReserved && (
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => updateTableStatus(table.id, "Occupied")}
                  >
                    Seat Guest
                  </button>
                )}

                <button
                  className="icon-btn"
                  style={{ width: 32, height: 32, color: "var(--charcoal-400)" }}
                  onClick={() => {
                    if (window.confirm(`Delete Table ${table.number}?`)) {
                      deleteTable(table.id);
                    }
                  }}
                  title="Delete table"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Add Modal */}
      <TableModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Move Table Modal */}
      {moveModalTableId && (
        <MoveTableModal
          isOpen={!!moveModalTableId}
          onClose={() => setMoveModalTableId(null)}
          fromTableId={moveModalTableId}
        />
      )}
    </div>
  );
};
