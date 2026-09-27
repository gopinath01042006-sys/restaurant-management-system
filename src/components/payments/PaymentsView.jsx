import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";
import { ProcessPaymentModal } from "./ProcessPaymentModal";
import { CreditCard, QrCode, Banknote, Globe, Search, Printer, Download, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { downloadCSV } from "../../utils/formatters";

export const PaymentsView = ({ onPrintReceipt }) => {
  const { payments, orders } = useRestaurant();

  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [payingOrder, setPayingOrder] = useState(null);

  // Pending unpaid orders
  const pendingOrders = orders.filter((o) => o.paymentStatus === "Pending" && o.status !== "Cancelled");

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTxn = p.id.toLowerCase().includes(q);
      const matchOrder = p.orderId.toLowerCase().includes(q);
      const matchCust = p.customerName?.toLowerCase().includes(q);
      const matchRef = p.referenceNumber?.toLowerCase().includes(q);
      return matchTxn || matchOrder || matchCust || matchRef;
    }
    return true;
  });

  const totalCollected = payments.filter((p) => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const upiTotal = payments.filter((p) => p.method === "UPI" && p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const cardTotal = payments.filter((p) => p.method === "Card" && p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
  const cashTotal = payments.filter((p) => p.method === "Cash" && p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);

  const handleExportCSV = () => {
    const exportData = filteredPayments.map((p) => ({
      txnId: p.id,
      orderId: p.orderId,
      customer: p.customerName,
      amount: p.amount,
      method: p.method,
      status: p.status,
      refNumber: p.referenceNumber,
      timestamp: p.timestamp
    }));

    downloadCSV("restaurant_payments_transactions", exportData, {
      txnId: "Transaction ID",
      orderId: "Order ID",
      customer: "Customer Name",
      amount: "Amount (INR)",
      method: "Payment Method",
      status: "Payment Status",
      refNumber: "Ref / Gateway ID",
      timestamp: "Date Time"
    });
  };

  const handlePrintTxnReceipt = (txn) => {
    const order = orders.find((o) => o.id === txn.orderId);
    if (order && onPrintReceipt) {
      onPrintReceipt(order);
    } else {
      // Mock minimal order object for receipt
      onPrintReceipt({
        id: txn.orderId,
        customerName: txn.customerName,
        total: txn.amount,
        subtotal: txn.amount * 0.9,
        cgst: txn.amount * 0.025,
        sgst: txn.amount * 0.025,
        serviceCharge: 0,
        paymentStatus: txn.status,
        paymentMethod: txn.method,
        createdAt: txn.timestamp,
        type: "Dine-in",
        items: [{ name: "Dining Bill Settlement", price: txn.amount, quantity: 1 }]
      });
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Payment & Revenue Register</h1>
          <p className="page-subtitle">Track transaction settlements, digital UPI collections, card charges, and refunds.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export Register
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>TOTAL COLLECTED</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--charcoal-900)" }}>{formatCurrency(totalCollected)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--success-600)", fontWeight: 600 }}>100% Reconciled</div>
        </div>

        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--primary-700)", fontWeight: 700 }}>UPI PAYMENTS (GPAY/PHONEPE)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-600)" }}>{formatCurrency(upiTotal)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>{Math.round((upiTotal / (totalCollected || 1)) * 100)}% of total</div>
        </div>

        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 700 }}>CARD PAYMENTS (POS)</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb" }}>{formatCurrency(cardTotal)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>{Math.round((cardTotal / (totalCollected || 1)) * 100)}% of total</div>
        </div>

        <div className="card" style={{ padding: "1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--success-700)", fontWeight: 700 }}>CASH AT REGISTER</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--success-600)" }}>{formatCurrency(cashTotal)}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>In register drawer</div>
        </div>
      </div>

      {/* Pending Unpaid Orders Quick Settlement Section */}
      {pendingOrders.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--warning-500)" }}>
          <div className="card-header" style={{ background: "#fffbeb" }}>
            <div>
              <h2 className="card-title" style={{ color: "#92400e" }}>
                Pending Unpaid Orders ({pendingOrders.length})
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#b45309" }}>Active dining bills awaiting cashier settlement</p>
            </div>
          </div>
          <div style={{ padding: "0.75rem 1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {pendingOrders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "var(--primary-600)", fontSize: "0.95rem" }}>{ord.id}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--charcoal-700)", fontWeight: 600 }}>{ord.customerName}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--charcoal-400)" }}>
                    {ord.type} {ord.tableId ? `(Table ${ord.tableId})` : ""}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--charcoal-900)" }}>{formatCurrency(ord.total)}</div>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: 4, fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
                    onClick={() => setPayingOrder(ord)}
                  >
                    Collect Bill
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {["all", "UPI", "Card", "Cash", "Online"].map((m) => (
              <button
                key={m}
                className={`pill-filter ${methodFilter === m ? "active" : ""}`}
                onClick={() => setMethodFilter(m)}
              >
                {m === "all" ? "All Methods" : m}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              className="form-control form-select"
              style={{ width: 140, padding: "0.4rem 1.8rem 0.4rem 0.75rem", fontSize: "0.82rem" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
            </select>

            <div className="input-with-icon" style={{ width: 240 }}>
              <Search size={15} className="input-icon" />
              <input
                type="text"
                className="form-control"
                style={{ padding: "0.4rem 0.75rem 0.4rem 2.2rem", fontSize: "0.85rem" }}
                placeholder="Search Txn ID, Order ID, guest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Reference / Gateway ID</th>
                <th>Date & Time</th>
                <th style={{ textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--charcoal-400)" }}>
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((txn) => (
                  <tr key={txn.id}>
                    <td>
                      <strong style={{ color: "var(--charcoal-900)" }}>{txn.id}</strong>
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary-600)" }}>{txn.orderId}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{txn.customerName}</div>
                    </td>
                    <td>
                      <strong style={{ fontSize: "0.95rem" }}>{formatCurrency(txn.amount)}</strong>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--charcoal-100)" }}>
                        {txn.method}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={txn.status} />
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--charcoal-600)" }}>
                        {txn.referenceNumber || "-"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>
                        {formatDateTime(txn.timestamp)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handlePrintTxnReceipt(txn)}
                        title="Print invoice receipt"
                      >
                        <Printer size={13} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Payment Modal */}
      {payingOrder && (
        <ProcessPaymentModal
          isOpen={!!payingOrder}
          onClose={() => setPayingOrder(null)}
          order={payingOrder}
        />
      )}
    </div>
  );
};
