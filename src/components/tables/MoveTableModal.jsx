import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const MoveTableModal = ({ isOpen, onClose, fromTableId }) => {
  const { tables, moveTableOrder } = useRestaurant();
  const [toTableId, setToTableId] = useState("");

  const availableTables = tables.filter((t) => t.status === "Available" && t.id !== fromTableId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!toTableId) {
      alert("Please choose a destination table.");
      return;
    }
    moveTableOrder(fromTableId, toTableId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Transfer Order from Table ${fromTableId}`}
      size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={availableTables.length === 0}>
            Transfer Order
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p style={{ fontSize: "0.88rem", color: "var(--charcoal-600)" }}>
          Select an available destination table to transfer the active guest order and bill.
        </p>

        <div className="form-group">
          <label className="form-label">
            Target Table <span className="required">*</span>
          </label>
          {availableTables.length === 0 ? (
            <div style={{ color: "var(--danger-500)", fontSize: "0.85rem", padding: "0.5rem 0" }}>
              No available tables right now to transfer to.
            </div>
          ) : (
            <select
              className="form-control form-select"
              value={toTableId}
              onChange={(e) => setToTableId(e.target.value)}
              required
            >
              <option value="">-- Choose destination table --</option>
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.number} ({t.section} • Capacity {t.capacity})
                </option>
              ))}
            </select>
          )}
        </div>
      </form>
    </Modal>
  );
};
