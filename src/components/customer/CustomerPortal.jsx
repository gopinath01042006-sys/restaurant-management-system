import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatCurrencyDetailed, formatDateTime } from "../../utils/formatters";
import { VegBadge } from "../common/Badge";
import {
  ShoppingBag,
  Package,
  Utensils,
  Search,
  Clock,
  Flame,
  Plus,
  Minus,
  Trash2,
  QrCode,
  CreditCard,
  Banknote,
  Globe,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
  MapPin,
  Phone,
  Receipt,
  UserCheck
} from "lucide-react";

export const CustomerPortal = ({ onSwitchToStaff }) => {
  const {
    menuItems,
    categories,
    createOrder,
    orders,
    currentUser,
    logoutUser,
    settings,
    showToast
  } = useRestaurant();

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Order Channel: Parcel (Takeaway) vs Dine-in
  const [orderType, setOrderType] = useState("Takeaway"); // Takeaway (Parcel), Dine-in
  const [tableNumber, setTableNumber] = useState("T-02");

  // Parcel / Takeaway Specific Details
  const [parcelOption, setParcelOption] = useState("Standard Spill-Proof Box");
  const [parcelPickupTime, setParcelPickupTime] = useState("Ready in 20-25 Mins (ASAP)");
  const [parcelNotes, setParcelNotes] = useState("");
  const [includeCutlery, setIncludeCutlery] = useState(false);

  // Cart state
  const [cart, setCart] = useState([
    {
      id: "menu-9",
      name: "Hyderabadi Chicken Dum Biryani",
      price: 460,
      quantity: 1,
      isVeg: false,
      notes: "Extra spicy salan"
    },
    {
      id: "menu-22",
      name: "Butter Garlic Naan",
      price: 90,
      quantity: 2,
      isVeg: true,
      notes: "Hot & crisp"
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("menu"); // menu, my-orders

  // Customer contact info
  const [customerName, setCustomerName] = useState(currentUser?.name || "Priya Nair");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98450 11234");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in INR

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          isVeg: item.isVeg,
          notes: ""
        }
      ];
    });
    showToast(`Added ${item.name} to cart`);
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.id === itemId) {
            const next = i.quantity + delta;
            return next > 0 ? { ...i, quantity: next } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Pricing calculations ("How much for food details")
  const foodSubtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const parcelPackagingFee = orderType === "Takeaway" && cart.length > 0 ? 25 : 0;
  const taxableAmount = Math.max(0, foodSubtotal - appliedDiscount);
  const gstAmount = Math.round((taxableAmount * 0.05) * 100) / 100; // 5% GST
  const grandTotal = Math.round((taxableAmount + parcelPackagingFee + gstAmount) * 100) / 100;
  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === "BHOJAN50") {
      setAppliedDiscount(50);
      showToast("Coupon BHOJAN50 applied! ₹50 off.");
    } else if (promoCode.trim().toUpperCase() === "ROYAL100") {
      setAppliedDiscount(100);
      showToast("Coupon ROYAL100 applied! ₹100 off.");
    } else {
      showToast("Invalid coupon code. Try BHOJAN50 or ROYAL100", "error");
    }
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Please add items to your food cart first.");
      return;
    }
    if (!customerName.trim() || !phone.trim()) {
      alert("Please enter your name and contact phone number.");
      return;
    }

    const noteDetails = [
      orderType === "Takeaway" ? `[PARCEL: ${parcelOption}, ${parcelPickupTime}]` : `[DINE-IN Table: ${tableNumber}]`,
      includeCutlery ? "Include eco cutlery & napkins" : "No plastic cutlery needed",
      parcelNotes ? `Note: ${parcelNotes}` : ""
    ].filter(Boolean).join(" • ");

    const newOrder = createOrder({
      type: orderType === "Takeaway" ? "Takeaway" : "Dine-in",
      tableId: orderType === "Dine-in" ? tableNumber : null,
      customerName: customerName.trim(),
      phone: phone.trim(),
      items: cart,
      discountType: appliedDiscount > 0 ? "fixed" : "none",
      discountValue: appliedDiscount,
      paymentMethod,
      paymentStatus: paymentMethod === "Cash" ? "Pending" : "Paid",
      notes: noteDetails
    });

    setIsCartOpen(false);
    setActiveTab("my-orders");
    showToast(`Order #${newOrder.id} placed! Kitchen is preparing your food.`);
  };

  // Filter dishes
  const filteredDishes = menuItems.filter((dish) => {
    if (!dish.isAvailable) return false;
    if (vegOnly && !dish.isVeg) return false;
    if (selectedCategory !== "all" && dish.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = dish.name.toLowerCase().includes(q);
      const matchDesc = dish.description?.toLowerCase().includes(q);
      const matchIngr = dish.ingredients?.toLowerCase().includes(q);
      return matchName || matchDesc || matchIngr;
    }
    return true;
  });

  // Customer's previous/active orders
  const customerOrders = orders.filter(
    (o) => o.customerName === customerName || (phone && o.phone === phone)
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", color: "var(--charcoal-900)", display: "flex", flexDirection: "column" }}>
      {/* Top Customer Navigation Header */}
      <header
        style={{
          background: "#0f172a",
          color: "#fff",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          borderBottom: "1px solid rgba(255,255,255,0.08)"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0.85rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(234, 88, 12, 0.4)"
              }}
            >
              <Flame size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "0.03em" }}>
                {settings.restaurantName || "BHOJAN"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--charcoal-300)" }}>
                Online Food Ordering & Parcel Counter
              </div>
            </div>
          </div>

          {/* Dine-in vs Parcel / Takeaway pill switcher */}
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-full)",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <button
              onClick={() => setOrderType("Takeaway")}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 700,
                background: orderType === "Takeaway" ? "var(--primary-500)" : "transparent",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 150ms"
              }}
            >
              <Package size={15} /> Parcel (Takeaway)
            </button>
            <button
              onClick={() => setOrderType("Dine-in")}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 700,
                background: orderType === "Dine-in" ? "var(--primary-500)" : "transparent",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 150ms"
              }}
            >
              <Utensils size={15} /> Dine-in Table
            </button>
          </div>

          {/* Actions: View Menu / My Orders / Cart Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setActiveTab(activeTab === "menu" ? "my-orders" : "menu")}
              className="btn btn-secondary btn-sm"
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                borderColor: "rgba(255,255,255,0.2)"
              }}
            >
              {activeTab === "menu" ? (
                <>
                  <Receipt size={14} /> My Orders ({customerOrders.length})
                </>
              ) : (
                <>
                  <Utensils size={14} /> Back to Food Menu
                </>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ padding: "0.45rem 1rem", position: "relative" }}
            >
              <ShoppingBag size={16} />
              <span>Cart: <strong>{formatCurrency(grandTotal)}</strong></span>
              {totalCartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "#fff",
                    color: "var(--primary-600)",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                  }}
                >
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Switch back to Staff Dashboard */}
            {onSwitchToStaff && (
              <button
                onClick={onSwitchToStaff}
                style={{
                  fontSize: "0.72rem",
                  color: "var(--primary-300)",
                  background: "transparent",
                  border: "1px solid rgba(251, 146, 60, 0.4)",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "var(--radius-sm)"
                }}
                title="Switch back to Staff & Admin RMS Dashboard"
              >
                Staff Mode ➔
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Announcement Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, #1e293b 0%, #334155 100%)",
          color: "#fff",
          padding: "1rem 1.25rem",
          borderBottom: "1px solid var(--border-light)"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
              <span>Welcome to Bhojan Customer Dining & Parcel Counter</span>
              <Sparkles size={16} color="var(--primary-400)" />
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--charcoal-300)", marginTop: 2 }}>
              Special Promo: Use code <strong>BHOJAN50</strong> for ₹50 off or <strong>ROYAL100</strong> on orders above ₹800!
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem", color: "#cbd5e1" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={14} color="var(--primary-400)" /> Parcel Prep Time: ~20 mins
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={14} color="var(--primary-400)" /> Indiranagar, Bengaluru
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "1.5rem 1.25rem", flex: 1 }}>
        {/* =========================================================================
            VIEW 1: MENU & PARCEL FOOD DETAILS
            ========================================================================= */}
        {activeTab === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Parcel Food Details & Preferences Box */}
            {orderType === "Takeaway" ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem" }}>
                  <Package size={20} color="var(--primary-600)" />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Parcel & Packaging Details</h3>
                  <span className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}>
                    Takeaway Mode
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Parcel Packaging Type</label>
                    <select
                      className="form-control form-select"
                      value={parcelOption}
                      onChange={(e) => setParcelOption(e.target.value)}
                    >
                      <option value="Standard Spill-Proof Box">Standard Spill-Proof Microwaveable Boxes</option>
                      <option value="Eco-Friendly Bagasse Containers">Eco-Friendly Sugarcane Bagasse Boxes</option>
                      <option value="Thermal Insulated Hot Bag">Thermal Insulated Foil Pack (+₹20)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pickup Schedule</label>
                    <select
                      className="form-control form-select"
                      value={parcelPickupTime}
                      onChange={(e) => setParcelPickupTime(e.target.value)}
                    >
                      <option value="Ready in 20-25 Mins (ASAP)">Ready in 20-25 Mins (Fresh & Fast)</option>
                      <option value="Pickup in 45 Mins">Pickup in 45 Mins</option>
                      <option value="Pickup in 1 Hour">Pickup in 1 Hour</option>
                      <option value="Evening Dinner Pickup (8:00 PM)">Evening Dinner Pickup (8:00 PM)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Parcel Packaging Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Keep gravies separate, extra green chutney..."
                      value={parcelNotes}
                      onChange={(e) => setParcelNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "0.75rem", fontSize: "0.82rem", color: "var(--charcoal-600)" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={includeCutlery}
                      onChange={(e) => setIncludeCutlery(e.target.checked)}
                    />
                    <span>Include disposable wooden spoon, fork, and tissue napkins</span>
                  </label>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Utensils size={20} color="var(--primary-600)" />
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Dine-in Table Ordering</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--charcoal-500)" }}>
                      Ordering food to be served directly to your restaurant table
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Table Number:</label>
                  <select
                    className="form-control form-select"
                    style={{ width: 120 }}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  >
                    <option value="T-01">Table T-01</option>
                    <option value="T-02">Table T-02</option>
                    <option value="T-03">Table T-03</option>
                    <option value="T-05">Table T-05</option>
                    <option value="T-07">Table T-07</option>
                    <option value="T-11">Table T-11</option>
                  </select>
                </div>
              </div>
            )}

            {/* Menu Search and Dietary Filter Bar */}
            <div
              style={{
                background: "#fff",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                border: "1px solid var(--border-light)",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div className="input-with-icon" style={{ flex: 1, minWidth: 260 }}>
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search biryani, butter chicken, naan, paneer, lassi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className={`pill-filter ${!vegOnly ? "active" : ""}`}
                    onClick={() => setVegOnly(false)}
                  >
                    All Dishes
                  </button>
                  <button
                    className={`pill-filter ${vegOnly ? "active" : ""}`}
                    onClick={() => setVegOnly(true)}
                    style={{ color: vegOnly ? "#fff" : "#047857" }}
                  >
                    🌱 Pure Vegetarian
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: 2 }}>
                <button
                  className={`pill-filter ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories ({menuItems.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    className={`pill-filter ${selectedCategory === c.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Menu Items Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.25rem"
              }}
            >
              {filteredDishes.map((dish) => {
                const cartItem = cart.find((i) => i.id === dish.id);

                return (
                  <div
                    key={dish.id}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "transform 150ms, box-shadow 150ms"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <VegBadge isVeg={dish.isVeg} />
                          <span style={{ fontSize: "0.72rem", color: "var(--charcoal-400)", fontWeight: 600 }}>
                            {dish.subcategory}
                          </span>
                        </div>
                        <span className="badge" style={{ background: "var(--charcoal-100)", color: "var(--charcoal-700)", fontSize: "0.7rem" }}>
                          <Clock size={11} /> {dish.prepTime}m
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--charcoal-900)", marginTop: 2, marginBottom: 6 }}>
                        {dish.name}
                      </h3>

                      <p style={{ fontSize: "0.82rem", color: "var(--charcoal-600)", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                        {dish.description}
                      </p>

                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                        <span className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}>
                          <Flame size={11} /> {dish.spiceLevel || "Medium"}
                        </span>
                        {dish.popular && (
                          <span className="badge" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                            ⭐ Chef Special
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Add to Cart action */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                      <div>
                        <div style={{ fontSize: "0.7rem", color: "var(--charcoal-400)" }}>Price for food:</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
                          {formatCurrency(dish.price)}
                        </div>
                      </div>

                      {cartItem ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--primary-50)", borderRadius: "var(--radius-md)", padding: "3px 8px", border: "1px solid var(--primary-200)" }}>
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            style={{ color: "var(--primary-700)", fontWeight: 800, padding: "2px 6px" }}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: "0.95rem", minWidth: 20, textAlign: "center" }}>
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            style={{ color: "var(--primary-700)", fontWeight: 800, padding: "2px 6px" }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => addToCart(dish)}
                          style={{ padding: "0.4rem 0.95rem", fontSize: "0.82rem" }}
                        >
                          <Plus size={15} /> Add Food
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: MY ORDERS & PARCEL STATUS
            ========================================================================= */}
        {activeTab === "my-orders" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>My Food Orders & Parcel Status</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--charcoal-500)" }}>
                  Real-time status updates as your dishes are cooked in the kitchen.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab("menu")}>
                <ArrowLeft size={14} /> Order More Food
              </button>
            </div>

            {customerOrders.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--charcoal-400)" }}>
                <ShoppingBag size={48} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                <h3>No previous orders found for {customerName}</h3>
                <p style={{ fontSize: "0.85rem", marginTop: 4 }}>Browse the menu and place your first food parcel!</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("menu")}
                  style={{ marginTop: "1rem" }}
                >
                  Explore Food Menu
                </button>
              </div>
            ) : (
              customerOrders.map((ord) => {
                const isReady = ord.kitchenStatus === "READY";
                const isPreparing = ord.kitchenStatus === "PREPARING";
                const isCompleted = ord.status === "Completed" || ord.status === "Served";

                return (
                  <div key={ord.id} className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: 700 }}>
                          {ord.type === "Takeaway" ? "📦 PARCEL ORDER" : "🍽️ DINE-IN ORDER"}
                        </div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Order #{ord.id}</h3>
                        <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>
                          Placed on {formatDateTime(ord.createdAt)}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
                          {formatCurrency(ord.total)}
                        </div>
                        <span className="badge" style={{ background: ord.paymentStatus === "Paid" ? "#ecfdf5" : "#fffbeb", color: ord.paymentStatus === "Paid" ? "#047857" : "#b45309" }}>
                          Payment: {ord.paymentStatus} ({ord.paymentMethod})
                        </span>
                      </div>
                    </div>

                    {/* Live Food Preparation Progress Bar */}
                    <div style={{ background: "var(--charcoal-50)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--charcoal-700)", marginBottom: 6 }}>
                        Live Kitchen Status:{" "}
                        <span style={{ color: isReady ? "var(--success-600)" : isPreparing ? "var(--primary-600)" : "var(--charcoal-900)" }}>
                          {isCompleted
                            ? "✅ Food Handed Over & Completed"
                            : isReady
                            ? "🎉 Ready for Parcel Pickup on Counter!"
                            : isPreparing
                            ? "🔥 Chef is Cooking Your Dishes in Kitchen..."
                            : "⏱️ Order Received & Queued in Kitchen"}
                        </span>
                      </div>

                      <div style={{ height: 8, borderRadius: 4, background: "var(--charcoal-200)", display: "flex", overflow: "hidden" }}>
                        <div
                          style={{
                            width: isCompleted ? "100%" : isReady ? "85%" : isPreparing ? "50%" : "20%",
                            background: isCompleted || isReady ? "var(--success-500)" : "var(--primary-500)",
                            transition: "width 400ms"
                          }}
                        />
                      </div>
                    </div>

                    {/* Ordered items breakdown */}
                    <div style={{ fontSize: "0.85rem", color: "var(--charcoal-700)" }}>
                      <strong>Items in this order:</strong>
                      <div style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                        {ord.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>{item.name} × {item.quantity}</span>
                            <strong>{formatCurrency(item.price * item.quantity)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ord.notes && (
                      <div style={{ marginTop: "0.75rem", fontSize: "0.76rem", color: "var(--charcoal-500)", fontStyle: "italic" }}>
                        Parcel & Table Details: {ord.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* =========================================================================
          SLIDE-OUT CHECKOUT & BILL DRAWER ("HOW MUCH FOR FOOD & PAYMENT METHOD")
          ========================================================================= */}
      {isCartOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsCartOpen(false)}
          style={{ justifyContent: "flex-end", padding: 0 }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              height: "100%",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--shadow-xl)",
              animation: "slideInRight 220ms cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingBag size={20} color="var(--primary-600)" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Your Food Cart & Bill</h3>
              </div>
              <button className="icon-btn" onClick={() => setIsCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Order Mode Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--charcoal-50)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)", textTransform: "uppercase", fontWeight: 700 }}>
                    Order Type
                  </span>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                    {orderType === "Takeaway" ? "📦 Takeaway Parcel" : `🍽️ Dine-in Table ${tableNumber}`}
                  </div>
                </div>
                {orderType === "Takeaway" && (
                  <span className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}>
                    {parcelPickupTime.split("(")[0]}
                  </span>
                )}
              </div>

              {/* Customer Contact Details */}
              <div style={{ background: "#fff", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 800, marginBottom: "0.5rem" }}>Guest Details</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.72rem" }}>Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.72rem" }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      style={{ fontSize: "0.82rem", padding: "0.4rem 0.6rem" }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 800, marginBottom: "0.6rem" }}>
                  Ordered Dishes ({totalCartCount} items)
                </h4>
                {cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--charcoal-400)" }}>
                    Cart is empty. Add your favorite dishes from the menu!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: "var(--charcoal-50)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>
                            {formatCurrency(item.price)} each
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            className="icon-btn"
                            style={{ width: 26, height: 26 }}
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 800, fontSize: "0.9rem", minWidth: 20, textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="icon-btn"
                            style={{ width: 26, height: 26 }}
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ color: "var(--danger-500)", marginLeft: 4 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Coupon code (e.g. BHOJAN50)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  style={{ fontSize: "0.85rem" }}
                />
                <button className="btn btn-secondary btn-sm" onClick={applyPromo}>
                  Apply
                </button>
              </div>

              {/* Payment Method Selector */}
              <div>
                <h4 style={{ fontSize: "0.88rem", fontWeight: 800, marginBottom: "0.6rem" }}>
                  Select Payment Method
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {[
                    { id: "UPI", label: "UPI / QR Code", icon: QrCode, desc: "GPay, PhonePe, Paytm" },
                    { id: "Card", label: "Card on Pickup", icon: CreditCard, desc: "Swipe POS Terminal" },
                    { id: "Cash", label: "Cash on Pickup", icon: Banknote, desc: "Pay Cash at Counter" },
                    { id: "Online", label: "NetBanking / Wallet", icon: Globe, desc: "Pay Online" }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          border: `2px solid ${isSelected ? "var(--primary-600)" : "var(--border-light)"}`,
                          background: isSelected ? "var(--primary-50)" : "#fff",
                          borderRadius: "var(--radius-md)",
                          padding: "0.65rem 0.75rem",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", fontWeight: 700, color: isSelected ? "var(--primary-700)" : "var(--charcoal-900)" }}>
                          <Icon size={14} />
                          <span>{m.label}</span>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--charcoal-500)" }}>
                          {m.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Details Breakdown ("How much for food details") */}
              <div
                style={{
                  background: "var(--charcoal-50)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem",
                  border: "1px solid var(--border-light)"
                }}
              >
                <h4 style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--charcoal-900)" }}>
                  Bill & Food Cost Details
                </h4>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                  <span>Food Item Charges:</span>
                  <span>{formatCurrencyDetailed(foodSubtotal)}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--danger-600)", marginBottom: 4 }}>
                    <span>Coupon Discount:</span>
                    <span>-{formatCurrencyDetailed(appliedDiscount)}</span>
                  </div>
                )}

                {orderType === "Takeaway" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: 4 }}>
                    <span>Parcel Packaging Charge:</span>
                    <span>{formatCurrencyDetailed(parcelPackagingFee)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--charcoal-500)", marginBottom: 4 }}>
                  <span>GST Tax (5% CGST+SGST):</span>
                  <span>{formatCurrencyDetailed(gstAmount)}</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    borderTop: "1px solid var(--border-light)",
                    paddingTop: 8,
                    marginTop: 6,
                    color: "var(--charcoal-900)"
                  }}
                >
                  <span>Total Amount to Pay:</span>
                  <span style={{ color: "var(--primary-600)" }}>{formatCurrencyDetailed(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer: Place Order Button */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-light)", background: "#fff" }}>
              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
                onClick={handlePlaceOrder}
                disabled={cart.length === 0}
              >
                <CheckCircle2 size={18} /> Confirm Order & Pay {formatCurrency(grandTotal)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
