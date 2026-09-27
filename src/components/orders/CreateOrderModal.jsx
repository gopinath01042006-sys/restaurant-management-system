import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatCurrencyDetailed } from "../../utils/formatters";
import { VegBadge } from "../common/Badge";
import { Plus, Minus, Trash2, Search, ShoppingBag, Utensils, CheckCircle2, UserPlus } from "lucide-react";

export const CreateOrderModal = ({ isOpen, onClose, initialTableId, initialCustomerId }) => {
  const { menuItems, categories, tables, customers, createOrder, settings } = useRestaurant();

  const [orderType, setOrderType] = useState(initialTableId ? "Dine-in" : "Dine-in");
  const [selectedTableId, setSelectedTableId] = useState(initialTableId || "T-02");
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Cart
  const [cart, setCart] = useState([]);
  const [searchMenu, setSearchMenu] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);

  // Discount & notes
  const [discountType, setDiscountType] = useState("none"); // none, percentage, fixed
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [orderNotes, setOrderNotes] = useState("");

  // When customer is selected from dropdown, prefill name and phone
  const handleCustomerChange = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setCustomerName(found.name);
      setPhone(found.phone);
    } else {
      setCustomerName("");
      setPhone("");
    }
  };

  // Add to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg, notes: "" }];
    });
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const updateItemNotes = (itemId, notes) => {
    setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, notes } : i)));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (discountType === "percentage") {
    discountAmount = (subtotal * (Number(discountValue) || 0)) / 100;
  } else if (discountType === "fixed") {
    discountAmount = Math.min(subtotal, Number(discountValue) || 0);
  }
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  const cgst = (taxableAmount * (settings.cgstRate || 2.5)) / 100;
  const sgst = (taxableAmount * (settings.sgstRate || 2.5)) / 100;
  const serviceCharge = orderType === "Dine-in" ? (taxableAmount * (settings.serviceChargeRate || 5.0)) / 100 : 0;
  const grandTotal = Math.round((taxableAmount + cgst + sgst + serviceCharge) * 100) / 100;

  // Filtered menu
  const filteredMenu = menuItems.filter((m) => {
    if (!m.isAvailable) return false;
    if (vegOnly && !m.isVeg) return false;
    if (selectedCategory !== "all" && m.category !== selectedCategory) return false;
    if (searchMenu) {
      const q = searchMenu.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.ingredients?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Please add at least one dish to the order.");
      return;
    }
    if (orderType === "Dine-in" && !selectedTableId) {
      alert("Please select a dining table.");
      return;
    }

    createOrder({
      type: orderType,
      tableId: orderType === "Dine-in" ? selectedTableId : null,
      customerId: selectedCustomerId,
      customerName: customerName || "Guest",
      phone,
      deliveryAddress,
      items: cart,
      discountType,
      discountValue,
      paymentMethod,
      paymentStatus,
      notes: orderNotes
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Restaurant Order"
      size="xl"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--charcoal-500)" }}>
              {cart.reduce((sum, i) => sum + i.quantity, 0)} Items in cart
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
              Total: {formatCurrency(grandTotal)}
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              <CheckCircle2 size={16} /> Confirm & Place Order
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem" }}>
        {/* Left Column: Order details & Menu Browser */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Order Type & Table Header */}
          <div style={{ background: "var(--charcoal-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              {["Dine-in", "Takeaway", "Delivery"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`btn btn-sm ${orderType === type ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1 }}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="form-row">
              {orderType === "Dine-in" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Select Table <span className="required">*</span>
                  </label>
                  <select
                    className="form-control form-select"
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.number} ({t.section} • {t.capacity} Seats • {t.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Existing Customer</label>
                <select
                  className="form-control form-select"
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">-- Walk-in / New Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row" style={{ marginTop: "0.75rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Guest Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 98765 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {orderType === "Delivery" && (
              <div className="form-group" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                <label className="form-label">Delivery Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apartment, Street, Landmark"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Menu Search and Filters */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div className="input-with-icon" style={{ flex: 1 }}>
              <Search size={16} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="Search dishes by name or ingredients..."
                value={searchMenu}
                onChange={(e) => setSearchMenu(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={`pill-filter ${vegOnly ? "active" : ""}`}
              onClick={() => setVegOnly(!vegOnly)}
              style={{ whiteSpace: "nowrap" }}
            >
              🌱 Veg Only
            </button>
          </div>

          {/* Category Pills */}
          <div style={{ display: "flex", gap: "0.35rem", overflowX: "auto", paddingBottom: 4 }}>
            <button
              type="button"
              className={`pill-filter ${selectedCategory === "all" ? "active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`pill-filter ${selectedCategory === c.id ? "active" : ""}`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div style={{ maxHeight: 340, overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", paddingRight: 4 }}>
            {filteredMenu.map((dish) => (
              <div
                key={dish.id}
                style={{
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 150ms"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--charcoal-900)" }}>{dish.name}</div>
                    <VegBadge isVeg={dish.isVeg} />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", marginBottom: 6, lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {dish.description}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontWeight: 800, color: "var(--charcoal-900)" }}>{formatCurrency(dish.price)}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => addToCart(dish)}
                    style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Cart & Bill Breakdown */}
        <div style={{ borderLeft: "1px solid var(--border-light)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h4 style={{ fontWeight: 800, fontSize: "1rem" }}>Current Order Cart</h4>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  style={{ fontSize: "0.75rem", color: "var(--danger-500)", fontWeight: 600 }}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--charcoal-400)", background: "var(--charcoal-50)", borderRadius: "var(--radius-md)" }}>
                  <ShoppingBag size={28} style={{ margin: "0 auto 0.5rem" }} />
                  <div>Your cart is empty.</div>
                  <div style={{ fontSize: "0.75rem" }}>Click "Add" on any dish to begin.</div>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--charcoal-50)",
                      borderRadius: "var(--radius-md)",
                      padding: "0.6rem 0.75rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--charcoal-900)" }}>{item.name}</div>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Add note (e.g. less spice, crispy)"
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        style={{ fontSize: "0.72rem", padding: "2px 6px", border: "1px solid var(--border-light)", borderRadius: 4, width: "60%" }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 24, height: 24 }}
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", minWidth: 16, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 24, height: 24 }}
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          style={{ color: "var(--danger-500)", marginLeft: 4 }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discount & Payment Controls */}
            <div style={{ background: "#fff", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Discount Type</label>
                  <select
                    className="form-control form-select"
                    style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                {discountType !== "none" && (
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>
                      {discountType === "percentage" ? "Discount %" : "Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <div>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Payment Method</label>
                  <select
                    className="form-control form-select"
                    style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Online">Online / Portal</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Payment Status</label>
                  <select
                    className="form-control form-select"
                    style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending (Pay Later)</option>
                    <option value="Paid">Pre-paid (Paid Now)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Special instructions for kitchen / bill notes..."
                  style={{ fontSize: "0.75rem", padding: "0.4rem 0.6rem" }}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 3 }}>
              <span>Subtotal:</span>
              <span>{formatCurrencyDetailed(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--danger-600)", marginBottom: 3 }}>
                <span>Discount:</span>
                <span>-{formatCurrencyDetailed(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)", marginBottom: 3 }}>
              <span>CGST (2.5%):</span>
              <span>{formatCurrencyDetailed(cgst)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)", marginBottom: 3 }}>
              <span>SGST (2.5%):</span>
              <span>{formatCurrencyDetailed(sgst)}</span>
            </div>
            {orderType === "Dine-in" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)", marginBottom: 3 }}>
                <span>Service Charge (5%):</span>
                <span>{formatCurrencyDetailed(serviceCharge)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, color: "var(--charcoal-900)", borderTop: "1px solid var(--border-light)", paddingTop: 6, marginTop: 4 }}>
              <span>Total Payable:</span>
              <span>{formatCurrencyDetailed(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
