import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const TableModal = ({ isOpen, onClose, tableToEdit }) => {
  const { addTable, tables } = useRestaurant();

  const [number, setNumber] = useState("");
  const [section, setSection] = useState("Main Hall");
  const [capacity, setCapacity] = useState(4);

  useEffect(() => {
    if (tableToEdit) {
      setNumber(tableToEdit.number);
      setSection(tableToEdit.section);
      setCapacity(tableToEdit.capacity);
    } else {
      setNumber(`T-0${tables.length + 1}`);
      setSection("Main Hall");
      setCapacity(4);
    }
  }, [tableToEdit, isOpen, tables.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number.trim()) {
      alert("Please provide a table number.");
      return;
    }

    addTable({
      number: number.trim(),
      section,
      capacity: Number(capacity) || 4
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tableToEdit ? `Edit Table ${tableToEdit.number}` : "Add Dining Table"}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Save Table
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">
            Table Number / Code <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. T-17 or B-01"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Dining Section / Area</label>
          <select
            className="form-control form-select"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="Main Hall">Main Hall (Indoor)</option>
            <option value="Family AC">Family AC Section</option>
            <option value="Terrace Garden">Terrace Garden (Outdoor)</option>
            <option value="Bar & Lounge">Bar & Lounge</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Seating Capacity (Guests)</label>
          <input
            type="number"
            min="1"
            max="20"
            className="form-control"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
