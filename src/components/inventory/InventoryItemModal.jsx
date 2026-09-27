import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const InventoryItemModal = ({ isOpen, onClose, itemToEdit }) => {
  const { addInventoryItem, inventory } = useRestaurant();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [currentStock, setCurrentStock] = useState(20);
  const [unit, setUnit] = useState("kg");
  const [minStock, setMinStock] = useState(10);
  const [supplier, setSupplier] = useState("");
  const [unitCost, setUnitCost] = useState(100);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setCurrentStock(itemToEdit.currentStock);
      setUnit(itemToEdit.unit);
      setMinStock(itemToEdit.minStock);
      setSupplier(itemToEdit.supplier || "");
      setUnitCost(itemToEdit.unitCost || 0);
    } else {
      setName("");
      setCategory("Vegetables");
      setCurrentStock(20);
      setUnit("kg");
      setMinStock(10);
      setSupplier("");
      setUnitCost(100);
    }
  }, [itemToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide the inventory item name.");
      return;
    }

    addInventoryItem({
      name: name.trim(),
      category,
      currentStock: Number(currentStock) || 0,
      unit,
      minStock: Number(minStock) || 5,
      supplier: supplier.trim() || "Local Mandi Supplier",
      unitCost: Number(unitCost) || 0
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? `Edit Inventory: ${itemToEdit.name}` : "Add Inventory Ingredient / Raw Supply"}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Save Inventory Item
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">
            Item Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Kasuri Methi or Shahi Jeera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              className="form-control form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Grains & Cereals">Grains & Cereals</option>
              <option value="Poultry & Meat">Poultry & Meat</option>
              <option value="Dairy">Dairy</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Oils & Ghee">Oils & Ghee</option>
              <option value="Spices & Herbs">Spices & Herbs</option>
              <option value="Beverages & Bar">Beverages & Bar</option>
              <option value="Packaging & Disposables">Packaging & Disposables</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Unit of Measure</label>
            <select
              className="form-control form-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="kg">kg (Kilograms)</option>
              <option value="L">L (Liters)</option>
              <option value="grams">grams</option>
              <option value="packets">packets / boxes</option>
              <option value="bottles">bottles</option>
              <option value="pieces">pieces / units</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Initial Stock Quantity</label>
            <input
              type="number"
              min="0"
              step="any"
              className="form-control"
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Minimum Threshold (Alert Trigger)</label>
            <input
              type="number"
              min="1"
              step="any"
              className="form-control"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Unit Cost (₹)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Supplier / Vendor Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Amul Fresh Dairy or Mandi Direct"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
