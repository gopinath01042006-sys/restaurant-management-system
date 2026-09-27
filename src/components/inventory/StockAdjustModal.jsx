import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const StockAdjustModal = ({ isOpen, onClose, item }) => {
  const { updateInventoryStock } = useRestaurant();

  const [adjustType, setAdjustType] = useState("increase"); // increase, decrease
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState("Restock Delivery");

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      alert("Please specify a positive quantity.");
      return;
    }

    const delta = adjustType === "increase" ? qty : -qty;
    updateInventoryStock(item.id, delta, reason);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock — ${item.name}`}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Apply Adjustment
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ background: "var(--charcoal-50)", padding: "0.85rem", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
          <div>Current On-hand Stock: <strong>{item.currentStock} {item.unit}</strong></div>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", marginTop: 2 }}>
            Minimum Threshold: {item.minStock} {item.unit}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Adjustment Type</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className={`btn btn-sm ${adjustType === "increase" ? "btn-success" : "btn-secondary"}`}
              style={{ flex: 1 }}
              onClick={() => {
                setAdjustType("increase");
                setReason("Restock Delivery");
              }}
            >
              + Restock / Add Quantity
            </button>
            <button
              type="button"
              className={`btn btn-sm ${adjustType === "decrease" ? "btn-danger" : "btn-secondary"}`}
              style={{ flex: 1 }}
              onClick={() => {
                setAdjustType("decrease");
                setReason("Kitchen Prep / Usage");
              }}
            >
              - Consume / Spoilage
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Quantity ({item.unit})</label>
          <input
            type="number"
            min="0.1"
            step="any"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Reason for Stock Adjustment</label>
          <select
            className="form-control form-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="Restock Delivery">New Supplier Restock Delivery</option>
            <option value="Kitchen Prep / Usage">Daily Kitchen Prep Usage</option>
            <option value="Damaged / Expired Goods">Waste / Spoilage / Damage</option>
            <option value="Inventory Audit Count Adjustment">Physical Audit Correction</option>
            <option value="Chef Tasting & Staff Meal">Staff Meal / Tasting</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};
