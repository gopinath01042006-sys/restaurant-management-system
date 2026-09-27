import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";
import { ShoppingBag, CalendarDays, TrendingUp, Heart, Phone, Mail, FileText, Plus } from "lucide-react";

export const CustomerProfileModal = ({ isOpen, onClose, customer, onOpenCreateOrder, onSelectOrder }) => {
  const { orders, reservations } = useRestaurant();
  const [activeTab, setActiveTab] = useState("orders"); // orders, reservations

  if (!customer) return null;

  // Linked orders
  const customerOrders = orders.filter(
    (o) => o.customerId === customer.id || o.phone === customer.phone || o.customerName === customer.name
  );

  // Linked reservations
  const customerReservations = reservations.filter(
    (r) => r.phone === customer.phone || r.customerName === customer.name
  );

  const avgOrderValue = customerOrders.length > 0 ? Math.round(customer.totalSpend / customerOrders.length) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customer Profile — ${customer.name}`}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              onClose();
              if (onOpenCreateOrder) onOpenCreateOrder(null, customer.id);
            }}
          >
            <Plus size={14} /> Create Order for Guest
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Customer Header Summary Card */}
        <div style={{ background: "var(--charcoal-50)", padding: "1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: 700, textTransform: "uppercase" }}>
                {customer.id}
              </div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
                {customer.name}
              </h2>
              <div style={{ display: "flex", gap: "1rem", marginTop: 4, fontSize: "0.85rem", color: "var(--charcoal-600)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={14} /> {customer.phone}
                </span>
                {customer.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Mail size={14} /> {customer.email}
                  </span>
                )}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>Last Visit</div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{formatDate(customer.lastVisit)}</div>
            </div>
          </div>

          {customer.notes && (
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-light)", fontSize: "0.82rem", color: "var(--charcoal-700)" }}>
              <strong>Guest Notes:</strong> {customer.notes}
            </div>
          )}
        </div>

        {/* 3 Metrics Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>LIFETIME SPEND</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
              {formatCurrency(customer.totalSpend)}
            </div>
          </div>

          <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>TOTAL VISITS / ORDERS</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-600)" }}>
              {customerOrders.length || customer.totalOrders}
            </div>
          </div>

          <div className="card" style={{ padding: "0.85rem", textAlign: "center" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>AVG TICKET (AOV)</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--success-600)" }}>
              {formatCurrency(avgOrderValue)}
            </div>
          </div>
        </div>

        {/* Favorite Dishes */}
        {customer.favoriteItems && customer.favoriteItems.length > 0 && (
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--charcoal-600)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <Heart size={14} color="var(--danger-500)" /> Most Frequent Orders:
            </div>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              {customer.favoriteItems.map((fav, i) => (
                <span key={i} className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)", border: "1px solid var(--primary-200)" }}>
                  {fav}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Switcher: Orders vs Reservations */}
        <div>
          <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border-light)", marginBottom: "0.75rem" }}>
            <button
              className={`pill-filter ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
              style={{ borderRadius: "6px 6px 0 0", borderBottom: "none" }}
            >
              Order History ({customerOrders.length})
            </button>
            <button
              className={`pill-filter ${activeTab === "reservations" ? "active" : ""}`}
              onClick={() => setActiveTab("reservations")}
              style={{ borderRadius: "6px 6px 0 0", borderBottom: "none" }}
            >
              Reservation History ({customerReservations.length})
            </button>
          </div>

          {activeTab === "orders" && (
            <div className="table-responsive" style={{ maxHeight: 240, overflowY: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Dishes</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "1.5rem", color: "var(--charcoal-400)" }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectOrder) onSelectOrder(ord);
                            }}
                            style={{ fontWeight: 700, color: "var(--primary-600)" }}
                          >
                            {ord.id}
                          </button>
                        </td>
                        <td>{ord.type} {ord.tableId ? `(${ord.tableId})` : ""}</td>
                        <td style={{ fontSize: "0.78rem" }}>
                          {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}
                        </td>
                        <td><strong>{formatCurrency(ord.total)}</strong></td>
                        <td><StatusBadge status={ord.status} /></td>
                        <td style={{ fontSize: "0.78rem" }}>{formatDate(ord.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "reservations" && (
            <div className="table-responsive" style={{ maxHeight: 240, overflowY: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Date & Time</th>
                    <th>Guests</th>
                    <th>Table</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerReservations.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem", color: "var(--charcoal-400)" }}>
                        No reservations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    customerReservations.map((r) => (
                      <tr key={r.id}>
                        <td><strong>{r.id}</strong></td>
                        <td>{formatDate(r.date)} at {r.time}</td>
                        <td>{r.guests} Guests</td>
                        <td>Table {r.tableId || "Unassigned"}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
