import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatCurrencyDetailed } from "../../utils/formatters";
import { CreditCard, QrCode, Banknote, Globe, CheckCircle } from "lucide-react";

export const ProcessPaymentModal = ({ isOpen, onClose, order }) => {
  const { processOrderPayment, settings } = useRestaurant();
  const [method, setMethod] = useState("UPI");
  const [amount, setAmount] = useState(order ? order.total : 0);

  if (!order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    processOrderPayment(order.id, method, Number(amount) || order.total);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Payment — Order #${order.id}`}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            <CheckCircle size={16} /> Complete Payment & Settle
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Bill summary card */}
        <div style={{ background: "var(--charcoal-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--charcoal-600)" }}>Guest Name:</span>
            <strong>{order.customerName}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--charcoal-600)" }}>Dining Ref:</span>
            <span>{order.type} {order.tableId ? `(Table ${order.tableId})` : ""}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: 6, marginTop: 6, fontSize: "1.15rem", fontWeight: 800 }}>
            <span>Net Payable:</span>
            <span style={{ color: "var(--primary-600)" }}>{formatCurrencyDetailed(order.total)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="form-label" style={{ marginBottom: "0.5rem" }}>Select Payment Mode</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            {[
              { id: "UPI", label: "UPI / QR Code", icon: QrCode, desc: "GPay, PhonePe, Paytm" },
              { id: "Card", label: "Debit / Credit Card", icon: CreditCard, desc: "POS Terminal Swipe" },
              { id: "Cash", label: "Cash Payment", icon: Banknote, desc: "Counter Cashier Handover" },
              { id: "Online", label: "Online Gateway", icon: Globe, desc: "Razorpay / App Pay" }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = method === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    border: `2px solid ${isSelected ? "var(--primary-600)" : "var(--border-light)"}`,
                    background: isSelected ? "var(--primary-50)" : "#fff",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    transition: "all 150ms"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.9rem", color: isSelected ? "var(--primary-700)" : "var(--charcoal-900)" }}>
                    <Icon size={16} />
                    <span>{m.label}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)" }}>
                    {m.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amount to Collect */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Amount Collected (₹)</label>
          <input
            type="number"
            step="any"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
