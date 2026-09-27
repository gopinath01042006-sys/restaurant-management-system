import React from "react";
import { Modal } from "../common/Modal";
import { StatusBadge } from "../common/Badge";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatCurrencyDetailed, formatDateTime } from "../../utils/formatters";
import { Printer, CheckCircle, Clock, AlertOctagon, CreditCard, ChevronRight } from "lucide-react";

export const OrderDetailModal = ({ isOpen, onClose, order, onPrintReceipt, onProcessPayment }) => {
  const { updateOrderStatus, settings } = useRestaurant();

  if (!order) return null;

  const nextStatusMap = {
    New: "Confirmed",
    Confirmed: "Preparing",
    Preparing: "Ready",
    Ready: "Served",
    Served: "Completed"
  };

  const nextStatus = nextStatusMap[order.status];

  const handleAdvanceStatus = () => {
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel Order #${order.id}?`)) {
      updateOrderStatus(order.id, "Cancelled");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details — #${order.id}`}
      size="lg"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div>
            {order.status !== "Completed" && order.status !== "Cancelled" && (
              <button className="btn btn-sm btn-danger" onClick={handleCancel}>
                Cancel Order
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={() => onPrintReceipt(order)}>
              <Printer size={16} /> Tax Receipt
            </button>
            {order.paymentStatus === "Pending" && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onProcessPayment(order);
                }}
              >
                <CreditCard size={16} /> Pay Bill
              </button>
            )}
            {nextStatus && (
              <button className="btn btn-success" onClick={handleAdvanceStatus}>
                <CheckCircle size={16} /> Advance to {nextStatus}
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Status banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--charcoal-50)",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)"
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)", textTransform: "uppercase", fontWeight: 700 }}>
              Current Status
            </div>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)", textTransform: "uppercase", fontWeight: 700 }}>
              Payment Status
            </div>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={order.paymentStatus} /> ({order.paymentMethod})
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)", textTransform: "uppercase", fontWeight: 700 }}>
              Kitchen Workflow
            </div>
            <div style={{ marginTop: 4, fontWeight: 700, color: "var(--primary-600)" }}>
              {order.kitchenStatus || "NEW"}
            </div>
          </div>
        </div>

        {/* Order Meta Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>Order Type & Table</div>
            <div style={{ fontWeight: 700 }}>
              {order.type} {order.tableId ? `(Table ${order.tableId})` : ""}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>Guest Name</div>
            <div style={{ fontWeight: 700 }}>{order.customerName}</div>
            {order.phone && <div style={{ fontSize: "0.75rem", color: "var(--charcoal-400)" }}>{order.phone}</div>}
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>Created Time</div>
            <div style={{ fontWeight: 700 }}>{formatDateTime(order.createdAt)}</div>
          </div>
        </div>

        {order.notes && (
          <div style={{ background: "var(--primary-50)", padding: "0.75rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem", color: "var(--primary-700)" }}>
            <strong>Special Note:</strong> {order.notes}
          </div>
        )}

        {/* Items Table */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem" }}>Ordered Dishes</h4>
          <div className="table-responsive" style={{ border: "1px solid var(--border-light)" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish Item</th>
                  <th>Price</th>
                  <th style={{ textAlign: "center" }}>Qty</th>
                  <th>Notes</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{formatCurrency(item.price)}</td>
                    <td style={{ textAlign: "center" }}><strong>{item.quantity}</strong></td>
                    <td style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>{item.notes || "-"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Summary */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 4, background: "var(--charcoal-50)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
              <span>Subtotal:</span>
              <span>{formatCurrencyDetailed(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--danger-600)" }}>
                <span>Discount:</span>
                <span>-{formatCurrencyDetailed(order.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)" }}>
              <span>CGST (2.5%):</span>
              <span>{formatCurrencyDetailed(order.cgst)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)" }}>
              <span>SGST (2.5%):</span>
              <span>{formatCurrencyDetailed(order.sgst)}</span>
            </div>
            {order.serviceCharge > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)" }}>
                <span>Service Charge (5%):</span>
                <span>{formatCurrencyDetailed(order.serviceCharge)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, borderTop: "1px solid var(--border-light)", paddingTop: 6, marginTop: 4 }}>
              <span>Grand Total:</span>
              <span>{formatCurrencyDetailed(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
