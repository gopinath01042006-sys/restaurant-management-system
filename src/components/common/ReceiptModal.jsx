import React from "react";
import { Modal } from "./Modal";
import { Printer, Download, CheckCircle, Clock } from "lucide-react";
import { formatCurrencyDetailed, formatDateTime } from "../../utils/formatters";
import { useRestaurant } from "../../context/RestaurantContext";

export const ReceiptModal = ({ isOpen, onClose, order }) => {
  const { settings } = useRestaurant();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice — ${order.id}`}
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
        </>
      }
    >
      <div className="receipt-paper" id="printable-receipt">
        <div className="receipt-header">
          <div className="receipt-title">{settings.restaurantName}</div>
          <div style={{ fontSize: "0.7rem", color: "#555", marginTop: 2 }}>{settings.tagline}</div>
          <div style={{ fontSize: "0.68rem", color: "#666", marginTop: 4 }}>{settings.address}</div>
          <div style={{ fontSize: "0.68rem", color: "#666" }}>Tel: {settings.phone}</div>
          <div style={{ fontSize: "0.68rem", color: "#666" }}>GSTIN: {settings.gstin}</div>
          <div style={{ fontSize: "0.68rem", color: "#666" }}>FSSAI Lic: {settings.fssaiNumber}</div>
        </div>

        <div className="receipt-row">
          <span>Order No:</span>
          <strong>{order.id}</strong>
        </div>
        <div className="receipt-row">
          <span>Date & Time:</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="receipt-row">
          <span>Order Type:</span>
          <strong>{order.type} {order.tableId ? `(Table ${order.tableId})` : ""}</strong>
        </div>
        <div className="receipt-row">
          <span>Customer:</span>
          <span>{order.customerName}</span>
        </div>
        {order.phone && (
          <div className="receipt-row">
            <span>Phone:</span>
            <span>{order.phone}</span>
          </div>
        )}

        <div className="receipt-divider"></div>

        <div className="receipt-row" style={{ fontWeight: 700, borderBottom: "1px dashed #999", paddingBottom: 4 }}>
          <span style={{ width: "50%" }}>ITEM</span>
          <span style={{ width: "15%", textAlign: "center" }}>QTY</span>
          <span style={{ width: "35%", textAlign: "right" }}>AMOUNT</span>
        </div>

        {order.items.map((item, idx) => (
          <div key={idx} className="receipt-row" style={{ margin: "4px 0" }}>
            <span style={{ width: "50%" }}>{item.name}</span>
            <span style={{ width: "15%", textAlign: "center" }}>{item.quantity}</span>
            <span style={{ width: "35%", textAlign: "right" }}>{formatCurrencyDetailed(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="receipt-divider"></div>

        <div className="receipt-row">
          <span>Subtotal:</span>
          <span>{formatCurrencyDetailed(order.subtotal)}</span>
        </div>

        {order.discountAmount > 0 && (
          <div className="receipt-row" style={{ color: "#c2410c" }}>
            <span>Discount:</span>
            <span>-{formatCurrencyDetailed(order.discountAmount)}</span>
          </div>
        )}

        <div className="receipt-row">
          <span>CGST (2.5%):</span>
          <span>{formatCurrencyDetailed(order.cgst)}</span>
        </div>
        <div className="receipt-row">
          <span>SGST (2.5%):</span>
          <span>{formatCurrencyDetailed(order.sgst)}</span>
        </div>

        {order.serviceCharge > 0 && (
          <div className="receipt-row">
            <span>Service Charge (5%):</span>
            <span>{formatCurrencyDetailed(order.serviceCharge)}</span>
          </div>
        )}

        <div className="receipt-divider"></div>

        <div className="receipt-total-row">
          <span>NET PAYABLE:</span>
          <span>{formatCurrencyDetailed(order.total)}</span>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-row">
          <span>Payment Status:</span>
          <strong>{order.paymentStatus.toUpperCase()}</strong>
        </div>
        <div className="receipt-row">
          <span>Payment Mode:</span>
          <span>{order.paymentMethod || "CASH"}</span>
        </div>

        <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.68rem", color: "#666" }}>
          <div>*** THANK YOU FOR DINING WITH US ***</div>
          <div>Please visit again!</div>
        </div>
      </div>
    </Modal>
  );
};
