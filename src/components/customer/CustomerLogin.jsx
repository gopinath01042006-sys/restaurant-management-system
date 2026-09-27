import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Flame, Phone, User, ArrowRight, Package, Utensils, Sparkles, ShieldCheck } from "lucide-react";

export const CustomerLogin = ({ onCustomerLogin, onSwitchToStaffLogin }) => {
  const { customers, settings } = useRestaurant();

  const [name, setName] = useState("Priya Nair");
  const [phone, setPhone] = useState("+91 98450 11234");
  const [orderPreference, setOrderPreference] = useState("Takeaway"); // Takeaway (Parcel), Dine-in

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Please provide your name and phone number.");
      return;
    }

    onCustomerLogin({
      id: "CUST-GUEST",
      name: name.trim(),
      phone: phone.trim(),
      role: "Customer",
      avatar: name.slice(0, 2).toUpperCase(),
      orderPreference
    });
  };

  const handleSelectDemoCustomer = (cust) => {
    setName(cust.name);
    setPhone(cust.phone);
    onCustomerLogin({
      ...cust,
      role: "Customer",
      avatar: cust.name.slice(0, 2).toUpperCase(),
      orderPreference
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)",
        padding: "1.5rem",
        position: "relative"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          padding: "2.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              margin: "0 auto 1rem",
              boxShadow: "var(--shadow-orange)"
            }}
          >
            <Flame size={28} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
            Customer Dining & Parcel Portal
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--charcoal-500)", marginTop: 4 }}>
            Sign in to explore menu details, calculate food prices, pick parcel packing, and pay securely.
          </p>
        </div>

        {/* Feature Highlights Banner */}
        <div
          style={{
            background: "var(--primary-50)",
            border: "1px solid var(--primary-200)",
            borderRadius: "var(--radius-md)",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: "0.78rem",
            color: "var(--primary-800)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
            <Sparkles size={14} color="var(--primary-600)" /> Customer Privileges:
          </div>
          <div>🍲 <strong>Browse 34+ Dishes</strong> with live preparation times & spice levels</div>
          <div>📦 <strong>Parcel Food Options</strong> with spill-proof box packing & cutlery</div>
          <div>💳 <strong>Instant Payment</strong> via UPI QR code, Cards, or Cash on Pickup</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Your Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Priya Nair"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number (For Parcel & Order SMS)</label>
            <div className="input-with-icon">
              <Phone size={16} className="input-icon" />
              <input
                type="tel"
                className="form-control"
                placeholder="+91 98450 11234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Preferred Dining Channel</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className={`btn btn-sm ${orderPreference === "Takeaway" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setOrderPreference("Takeaway")}
              >
                <Package size={15} /> Parcel (Takeaway)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${orderPreference === "Dine-in" ? "btn-primary" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setOrderPreference("Dine-in")}
              >
                <Utensils size={15} /> Dine-in Table
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "0.85rem", fontSize: "0.95rem", marginTop: 4 }}
          >
            Enter Customer Menu & Parcel Counter <ArrowRight size={16} />
          </button>
        </form>

        {/* 1-Click Fast Diner Select */}
        <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "1rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.5rem", textAlign: "center" }}>
            Or 1-Click Login As Regular Customer
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {customers.slice(0, 4).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectDemoCustomer(c)}
                style={{
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-light)",
                  background: "var(--charcoal-50)",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--charcoal-900)"
                }}
              >
                <div>{c.name}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--charcoal-400)" }}>{c.phone}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Link to Staff Management */}
        <div style={{ textAlign: "center", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
          <button
            onClick={onSwitchToStaffLogin}
            style={{ fontSize: "0.8rem", color: "var(--primary-600)", fontWeight: 600 }}
          >
            Are you Restaurant Staff? Switch to Staff / Admin Login ➔
          </button>
        </div>
      </div>
    </div>
  );
};
