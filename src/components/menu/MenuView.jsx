import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { MenuItemModal } from "./MenuItemModal";
import { formatCurrency } from "../../utils/formatters";
import { VegBadge } from "../common/Badge";
import {
  Plus,
  Search,
  Clock,
  Flame,
  Copy,
  Edit2,
  Trash2,
  Power,
  UtensilsCrossed,
  Filter
} from "lucide-react";

export const MenuView = () => {
  const {
    menuItems,
    categories,
    toggleMenuItemAvailability,
    deleteMenuItem,
    addMenuItem
  } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dietaryFilter, setDietaryFilter] = useState("all"); // all, veg, non-veg
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Filter dishes
  const filteredDishes = menuItems.filter((dish) => {
    if (selectedCategory !== "all" && dish.category !== selectedCategory) return false;
    if (dietaryFilter === "veg" && !dish.isVeg) return false;
    if (dietaryFilter === "non-veg" && dish.isVeg) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchDesc = dish.description?.toLowerCase().includes(q);
      const matchIngr = dish.ingredients?.toLowerCase().includes(q);
      const matchSub = dish.subcategory?.toLowerCase().includes(q);
      return matchName || matchDesc || matchIngr || matchSub;
    }

    return true;
  });

  const handleDuplicate = (dish) => {
    addMenuItem({
      ...dish,
      name: `${dish.name} (Copy)`
    });
  };

  const handleEdit = (dish) => {
    setEditingItem(dish);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Configure recipes, pricing, ingredients, live item availability, and dietary tags.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Dish
          </button>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Top row: Search & Dietary toggles */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div className="input-with-icon" style={{ flex: 1, minWidth: 260 }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search menu by name, subcategory, or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                className={`pill-filter ${dietaryFilter === "all" ? "active" : ""}`}
                onClick={() => setDietaryFilter("all")}
              >
                All Dietary
              </button>
              <button
                className={`pill-filter ${dietaryFilter === "veg" ? "active" : ""}`}
                onClick={() => setDietaryFilter("veg")}
                style={{ color: dietaryFilter === "veg" ? "#fff" : "#047857" }}
              >
                🌱 Pure Veg ({menuItems.filter((i) => i.isVeg).length})
              </button>
              <button
                className={`pill-filter ${dietaryFilter === "non-veg" ? "active" : ""}`}
                onClick={() => setDietaryFilter("non-veg")}
                style={{ color: dietaryFilter === "non-veg" ? "#fff" : "#b91c1c" }}
              >
                🍗 Non-Veg ({menuItems.filter((i) => !i.isVeg).length})
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: 4 }}>
            <button
              className={`pill-filter ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Categories ({menuItems.length})
            </button>
            {categories.map((c) => {
              const count = menuItems.filter((i) => i.category === c.id).length;
              return (
                <button
                  key={c.id}
                  className={`pill-filter ${selectedCategory === c.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Dishes Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {filteredDishes.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "var(--charcoal-400)", background: "#fff", borderRadius: "var(--radius-lg)" }}>
            <UtensilsCrossed size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <h3>No menu items found</h3>
            <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Try clearing the search or category filters.</p>
          </div>
        ) : (
          filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.25rem",
                opacity: dish.isAvailable ? 1 : 0.65,
                background: dish.isAvailable ? "#fff" : "#f8fafc"
              }}
            >
              <div>
                {/* Header: Title, Veg Badge, Availability Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <VegBadge isVeg={dish.isVeg} />
                      <span style={{ fontSize: "0.72rem", color: "var(--charcoal-400)", fontWeight: 600 }}>
                        {dish.subcategory}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--charcoal-900)", lineHeight: 1.25 }}>
                      {dish.name}
                    </h3>
                  </div>

                  {/* Availability toggle switch */}
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: 4
                    }}
                    title={dish.isAvailable ? "Item available (click to mark 86 / out of stock)" : "Item out of stock (click to mark available)"}
                  >
                    <input
                      type="checkbox"
                      checked={dish.isAvailable}
                      onChange={() => toggleMenuItemAvailability(dish.id)}
                      style={{ cursor: "pointer", width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: dish.isAvailable ? "var(--success-600)" : "var(--charcoal-400)" }}>
                      {dish.isAvailable ? "In Stock" : "86'd"}
                    </span>
                  </label>
                </div>

                {/* Description */}
                <p style={{ fontSize: "0.82rem", color: "var(--charcoal-600)", marginBottom: "0.85rem", lineHeight: 1.4 }}>
                  {dish.description}
                </p>

                {/* Meta pills: Prep time, Spice, Tax */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                  <span className="badge" style={{ background: "var(--charcoal-100)", color: "var(--charcoal-700)" }}>
                    <Clock size={11} /> {dish.prepTime} mins
                  </span>
                  <span className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}>
                    <Flame size={11} /> {dish.spiceLevel || "Medium"}
                  </span>
                  <span className="badge" style={{ background: "var(--charcoal-50)", color: "var(--charcoal-600)" }}>
                    GST {dish.taxRate}%
                  </span>
                </div>

                {/* Ingredients snippet */}
                {dish.ingredients && (
                  <div style={{ fontSize: "0.74rem", color: "var(--charcoal-500)", fontStyle: "italic", marginBottom: "0.75rem" }}>
                    <strong>Contains:</strong> {dish.ingredients}
                  </div>
                )}
              </div>

              {/* Price & Actions Bottom */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
                  {formatCurrency(dish.price)}
                </div>

                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32 }}
                    onClick={() => handleDuplicate(dish)}
                    title="Duplicate recipe"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32 }}
                    onClick={() => handleEdit(dish)}
                    title="Edit dish"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32, color: "var(--danger-500)" }}
                    onClick={() => {
                      if (window.confirm(`Delete "${dish.name}" from restaurant menu?`)) {
                        deleteMenuItem(dish.id);
                      }
                    }}
                    title="Delete dish"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        itemToEdit={editingItem}
      />
    </div>
  );
};
