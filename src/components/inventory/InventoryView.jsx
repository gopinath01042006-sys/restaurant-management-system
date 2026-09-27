import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";
import { StockAdjustModal } from "./StockAdjustModal";
import { InventoryItemModal } from "./InventoryItemModal";
import {
  PackageCheck,
  AlertTriangle,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Edit2,
  Download,
  CheckCircle2
} from "lucide-react";
import { downloadCSV } from "../../utils/formatters";

export const InventoryView = () => {
  const { inventory, deleteInventoryItem } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all"); // all, low, healthy, out

  const [adjustingItem, setAdjustingItem] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;

    if (stockStatusFilter === "low" && item.currentStock > item.minStock) return false;
    if (stockStatusFilter === "out" && item.currentStock > 0) return false;
    if (stockStatusFilter === "healthy" && item.currentStock <= item.minStock) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchSupp = item.supplier?.toLowerCase().includes(q);
      return matchName || matchCat || matchSupp;
    }

    return true;
  });

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minStock);
  const totalValuation = inventory.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);

  const categories = Array.from(new Set(inventory.map((i) => i.category)));

  const handleExportCSV = () => {
    const exportData = filteredInventory.map((i) => ({
      id: i.id,
      name: i.name,
      category: i.category,
      stock: i.currentStock,
      unit: i.unit,
      minStock: i.minStock,
      status: i.currentStock === 0 ? "Out of Stock" : i.currentStock <= i.minStock ? "Low Stock" : "In Stock",
      unitCost: i.unitCost,
      supplier: i.supplier,
      lastUpdated: i.lastUpdated
    }));

    downloadCSV("restaurant_inventory_report", exportData, {
      id: "Item ID",
      name: "Item Name",
      category: "Category",
      stock: "Current Stock",
      unit: "Unit",
      minStock: "Min Threshold",
      status: "Stock Status",
      unitCost: "Unit Cost (INR)",
      supplier: "Supplier",
      lastUpdated: "Last Updated"
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Inventory & Stock Control</h1>
          <p className="page-subtitle">Track raw materials, kitchen provisions, reorder thresholds, and stock valuation.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export Inventory
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setItemToEdit(null);
              setIsItemModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if applicable */}
      {lowStockItems.length > 0 && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "var(--radius-lg)",
            padding: "1rem 1.25rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309" }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#92400e" }}>
                {lowStockItems.length} Ingredients require immediate replenishment
              </div>
              <div style={{ fontSize: "0.78rem", color: "#b45309" }}>
                {lowStockItems.map((i) => i.name).join(", ").slice(0, 80)}...
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setStockStatusFilter("low")}
            style={{ fontSize: "0.75rem" }}
          >
            View Low Stock Items
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.25rem" }}>
        <div className="card" style={{ padding: "0.85rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>TOTAL INGREDIENTS</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{inventory.length} SKUs</div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", fontWeight: 700 }}>STOCK VALUATION</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
            {formatCurrency(totalValuation)}
          </div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--danger-600)", fontWeight: 700 }}>BELOW MINIMUM</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--danger-600)" }}>
            {lowStockItems.length} Items
          </div>
        </div>

        <div className="card" style={{ padding: "0.85rem 1rem" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--success-600)", fontWeight: 700 }}>HEALTHY STOCK</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--success-600)" }}>
            {inventory.length - lowStockItems.length} Items
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            <button
              className={`pill-filter ${stockStatusFilter === "all" ? "active" : ""}`}
              onClick={() => setStockStatusFilter("all")}
            >
              All Items
            </button>
            <button
              className={`pill-filter ${stockStatusFilter === "low" ? "active" : ""}`}
              onClick={() => setStockStatusFilter("low")}
              style={{ color: stockStatusFilter === "low" ? "#fff" : "var(--danger-600)" }}
            >
              ⚠️ Low Stock ({lowStockItems.length})
            </button>
            <button
              className={`pill-filter ${stockStatusFilter === "healthy" ? "active" : ""}`}
              onClick={() => setStockStatusFilter("healthy")}
            >
              Healthy Levels
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <select
              className="form-control form-select"
              style={{ width: 180, padding: "0.4rem 1.8rem 0.4rem 0.75rem", fontSize: "0.82rem" }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="input-with-icon" style={{ width: 220 }}>
              <Search size={15} className="input-icon" />
              <input
                type="text"
                className="form-control"
                style={{ padding: "0.4rem 0.75rem 0.4rem 2.2rem", fontSize: "0.85rem" }}
                placeholder="Search ingredient or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Ingredient Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Threshold</th>
                <th>Status</th>
                <th>Unit Cost</th>
                <th>Total Value</th>
                <th>Supplier</th>
                <th style={{ textAlign: "right" }}>Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: "center", padding: "3rem", color: "var(--charcoal-400)" }}>
                    No inventory records match your filters.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const isLow = item.currentStock <= item.minStock;
                  const isOut = item.currentStock === 0;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong style={{ color: "var(--charcoal-500)" }}>{item.id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: "var(--charcoal-900)" }}>{item.name}</strong>
                      </td>
                      <td>
                        <span className="badge" style={{ background: "var(--charcoal-100)" }}>
                          {item.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "1rem", fontWeight: 800, color: isLow ? "var(--danger-600)" : "inherit" }}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "var(--charcoal-500)" }}>
                          {item.minStock} {item.unit}
                        </span>
                      </td>
                      <td>
                        {isOut ? (
                          <StatusBadge status="Out of Stock" />
                        ) : isLow ? (
                          <StatusBadge status="Low Stock" />
                        ) : (
                          <StatusBadge status="In Stock" />
                        )}
                      </td>
                      <td>{formatCurrency(item.unitCost)}</td>
                      <td>
                        <strong>{formatCurrency(item.currentStock * item.unitCost)}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.8rem", color: "var(--charcoal-600)" }}>
                          {item.supplier}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => setAdjustingItem(item)}
                            title="Adjust quantity"
                          >
                            <SlidersHorizontal size={13} /> Adjust
                          </button>
                          <button
                            className="icon-btn"
                            style={{ width: 30, height: 30, color: "var(--danger-500)" }}
                            onClick={() => {
                              if (window.confirm(`Delete ${item.name} from inventory?`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            title="Delete item"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjust Modal */}
      {adjustingItem && (
        <StockAdjustModal
          isOpen={!!adjustingItem}
          onClose={() => setAdjustingItem(null)}
          item={adjustingItem}
        />
      )}

      {/* Inventory Item Create/Edit Modal */}
      <InventoryItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setItemToEdit(null);
        }}
        itemToEdit={itemToEdit}
      />
    </div>
  );
};
