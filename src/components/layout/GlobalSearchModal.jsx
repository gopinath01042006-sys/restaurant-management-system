import React, { useState, useEffect, useRef } from "react";
import { Search, X, ShoppingBag, UtensilsCrossed, Users, Grid3X3, PackageCheck, UserCog, ArrowRight } from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency } from "../../utils/formatters";

export const GlobalSearchModal = ({ isOpen, onClose, setActiveModule, onSelectOrder }) => {
  const { orders, menuItems, customers, tables, inventory, staff } = useRestaurant();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open if parent passes trigger
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search matches
  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          (o.tableId && o.tableId.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const matchedMenu = q
    ? menuItems.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.subcategory?.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedTables = q
    ? tables.filter(
        (t) =>
          t.number.toLowerCase().includes(q) ||
          t.section.toLowerCase().includes(q) ||
          t.status.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedInventory = q
    ? inventory.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalResults =
    matchedOrders.length +
    matchedMenu.length +
    matchedCustomers.length +
    matchedTables.length +
    matchedInventory.length;

  const handleSelect = (module, item) => {
    setActiveModule(module);
    if (module === "orders" && onSelectOrder && item) {
      onSelectOrder(item);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Search size={20} className="text-charcoal-400" />
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Type dish name, Order ID, guest phone, table..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: "none", boxShadow: "none", fontSize: "1rem", padding: "0.4rem 0" }}
          />
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: "auto", padding: "1rem" }}>
          {!q ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--charcoal-400)", fontSize: "0.88rem" }}>
              Search across <strong>Orders</strong>, <strong>Dishes</strong>, <strong>Guests</strong>, <strong>Tables</strong>, and <strong>Inventory</strong>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--charcoal-400)" }}>
              No results found matching "<strong>{query}</strong>"
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Orders */}
              {matchedOrders.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.4rem" }}>
                    Orders
                  </div>
                  {matchedOrders.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => handleSelect("orders", o)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: "var(--charcoal-50)",
                        marginBottom: "0.35rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <ShoppingBag size={16} color="var(--primary-600)" />
                        <div>
                          <strong>{o.id}</strong> — {o.customerName} ({o.type}{o.tableId ? `, Table ${o.tableId}` : ""})
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(o.total)}</span>
                        <ArrowRight size={14} color="var(--charcoal-400)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Menu Items */}
              {matchedMenu.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.4rem" }}>
                    Menu Dishes
                  </div>
                  {matchedMenu.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelect("menu", m)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: "var(--charcoal-50)",
                        marginBottom: "0.35rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <UtensilsCrossed size={16} color="var(--primary-600)" />
                        <div>
                          <strong>{m.name}</strong> <span style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>({m.subcategory})</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(m.price)}</span>
                        <ArrowRight size={14} color="var(--charcoal-400)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers */}
              {matchedCustomers.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.4rem" }}>
                    Customers CRM
                  </div>
                  {matchedCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelect("customers", c)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: "var(--charcoal-50)",
                        marginBottom: "0.35rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <Users size={16} color="var(--primary-600)" />
                        <div>
                          <strong>{c.name}</strong> <span style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>({c.phone})</span>
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--charcoal-400)" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tables */}
              {matchedTables.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.4rem" }}>
                    Floor Tables
                  </div>
                  {matchedTables.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleSelect("tables", t)}
                      style={{
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        background: "var(--charcoal-50)",
                        marginBottom: "0.35rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <Grid3X3 size={16} color="var(--primary-600)" />
                        <div>
                          Table <strong>{t.number}</strong> ({t.section} • {t.capacity} Seats • {t.status})
                        </div>
                      </div>
                      <ArrowRight size={14} color="var(--charcoal-400)" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
