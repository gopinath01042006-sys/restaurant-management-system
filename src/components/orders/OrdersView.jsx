import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";
import { Search, Plus, Filter, Eye, Printer, CheckCircle, ArrowRight, Download } from "lucide-react";
import { downloadCSV } from "../../utils/formatters";

export const OrdersView = ({ onOpenCreateOrder, onSelectOrder, onPrintReceipt, onProcessPayment }) => {
  const { orders, updateOrderStatus } = useRestaurant();

  const [activeTab, setActiveTab] = useState("all"); // all, active, dine-in, takeaway, delivery, completed, cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtering
  const filteredOrders = orders.filter((ord) => {
    // Tab filter
    if (activeTab === "active" && (ord.status === "Completed" || ord.status === "Cancelled")) return false;
    if (activeTab === "dine-in" && ord.type !== "Dine-in") return false;
    if (activeTab === "takeaway" && ord.type !== "Takeaway") return false;
    if (activeTab === "delivery" && ord.type !== "Delivery") return false;
    if (activeTab === "completed" && ord.status !== "Completed") return false;
    if (activeTab === "cancelled" && ord.status !== "Cancelled") return false;

    // Status filter
    if (statusFilter !== "all" && ord.status !== statusFilter) return false;

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = ord.id.toLowerCase().includes(q);
      const matchCust = ord.customerName?.toLowerCase().includes(q);
      const matchTable = ord.tableId?.toLowerCase().includes(q);
      const matchPhone = ord.phone?.includes(q);
      return matchId || matchCust || matchTable || matchPhone;
    }

    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredOrders.map((o) => ({
      id: o.id,
      type: o.type,
      table: o.tableId || "-",
      customer: o.customerName,
      phone: o.phone || "-",
      subtotal: o.subtotal,
      discount: o.discountAmount,
      tax: (o.cgst + o.sgst).toFixed(2),
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.status,
      created: o.createdAt
    }));

    downloadCSV("restaurant_orders_export", exportData, {
      id: "Order ID",
      type: "Type",
      table: "Table",
      customer: "Customer Name",
      phone: "Phone",
      subtotal: "Subtotal",
      discount: "Discount",
      tax: "Tax",
      total: "Total Amount",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status",
      orderStatus: "Order Status",
      created: "Created At"
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, filter, and manage dine-in, takeaway, and delivery orders.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={onOpenCreateOrder}>
            <Plus size={16} /> Create Order
          </button>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Channel Tabs */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {[
              { id: "all", label: "All Orders" },
              { id: "active", label: "⚡ Active Orders" },
              { id: "dine-in", label: "Dine-in" },
              { id: "takeaway", label: "Takeaway" },
              { id: "delivery", label: "Delivery" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`pill-filter ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Status dropdown */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div className="input-with-icon" style={{ width: 240 }}>
              <Search size={15} className="input-icon" />
              <input
                type="text"
                className="form-control"
                style={{ padding: "0.4rem 0.75rem 0.4rem 2.2rem", fontSize: "0.85rem" }}
                placeholder="Search ID, customer, table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-control form-select"
              style={{ width: 140, padding: "0.4rem 1.8rem 0.4rem 0.75rem", fontSize: "0.82rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Served">Served</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Type & Table</th>
                <th>Customer Info</th>
                <th>Dishes Ordered</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--charcoal-400)" }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <strong style={{ color: "var(--primary-600)" }}>{ord.id}</strong>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--charcoal-100)", color: "var(--charcoal-800)" }}>
                        {ord.type} {ord.tableId ? `• ${ord.tableId}` : ""}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ord.customerName}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--charcoal-400)" }}>{ord.phone || "Walk-in"}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem", color: "var(--charcoal-700)", maxWidth: 220 }} title={ord.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}>
                        {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(", ").slice(0, 42)}
                        {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(", ").length > 42 ? "..." : ""}
                      </div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "0.92rem" }}>{formatCurrency(ord.total)}</strong>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <StatusBadge status={ord.paymentStatus} />
                        <span style={{ fontSize: "0.68rem", color: "var(--charcoal-500)" }}>{ord.paymentMethod}</span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={ord.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>
                        {formatDateTime(ord.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onSelectOrder(ord)}
                          title="View order details"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onPrintReceipt(ord)}
                          title="Print tax invoice"
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
