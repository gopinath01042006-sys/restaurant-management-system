import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Flame, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, Package, Utensils, User, Phone, Sparkles } from "lucide-react";

export const LoginView = ({ onLoginSuccess }) => {
  const { loginUser, loginCustomer, staff, customers, settings } = useRestaurant();

  const [loginMode, setLoginMode] = useState("customer"); // "customer" by default per user request, or "staff"

  // Staff login fields
  const [email, setEmail] = useState("aditya.admin@bhojan.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");

  // Customer login fields
  const [customerName, setCustomerName] = useState("Priya Nair");
  const [customerPhone, setCustomerPhone] = useState("+91 98450 11234");
  const [orderPreference, setOrderPreference] = useState("Takeaway"); // Takeaway (Parcel), Dine-in

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    const res = loginUser(email.trim(), password);
    if (res.success && onLoginSuccess) {
      onLoginSuccess(res.user);
    }
  };

  const handleQuickRoleLogin = (staffMember) => {
    const res = loginUser(staffMember.email, "demo");
    if (res.success && onLoginSuccess) {
      onLoginSuccess(res.user);
    }
  };

  const handleCustomerSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please provide your name and phone number.");
      return;
    }

    const customerUser = loginCustomer({
      id: "CUST-GUEST",
      name: customerName.trim(),
      phone: customerPhone.trim(),
      role: "Customer",
      avatar: customerName.slice(0, 2).toUpperCase(),
      orderPreference
    });

    if (onLoginSuccess) {
      onLoginSuccess(customerUser);
    }
  };

  const handleSelectDemoCustomer = (cust) => {
    const customerUser = loginCustomer({
      ...cust,
      role: "Customer",
      avatar: cust.name.slice(0, 2).toUpperCase(),
      orderPreference
    });
    if (onLoginSuccess) {
      onLoginSuccess(customerUser);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #090d16 0%, #1e293b 50%, #0f172a 100%)",
        padding: "1.5rem"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 500,
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          padding: "2.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
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
              margin: "0 auto 0.75rem",
              boxShadow: "var(--shadow-orange)"
            }}
          >
            <Flame size={28} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--charcoal-900)" }}>
            {settings.restaurantName || "BHOJAN DINING"}
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--charcoal-500)", marginTop: 2 }}>
            {loginMode === "customer"
              ? "Customer Food Ordering, Pricing & Parcel Counter"
              : "Staff & Management Operations OS"}
          </p>
        </div>

        {/* Portal Mode Tab Switcher: Customer vs Staff */}
        <div
          style={{
            display: "flex",
            background: "var(--charcoal-50)",
            padding: 4,
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--border-light)"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLoginMode("customer");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "0.55rem 0.85rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              background: loginMode === "customer" ? "var(--primary-600)" : "transparent",
              color: loginMode === "customer" ? "#fff" : "var(--charcoal-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms",
              boxShadow: loginMode === "customer" ? "var(--shadow-sm)" : "none"
            }}
          >
            <Package size={16} /> Customer Food & Parcel
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode("staff");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "0.55rem 0.85rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              fontWeight: 700,
              background: loginMode === "staff" ? "var(--charcoal-900)" : "transparent",
              color: loginMode === "staff" ? "#fff" : "var(--charcoal-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 150ms",
              boxShadow: loginMode === "staff" ? "var(--shadow-sm)" : "none"
            }}
          >
            <ShieldCheck size={16} /> Staff & Admin
          </button>
        </div>

        {error && (
          <div style={{ background: "var(--danger-50)", border: "1px solid #fecaca", color: "var(--danger-600)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-md)", fontSize: "0.82rem" }}>
            {error}
          </div>
        )}

        {/* =========================================================================
            MODE 1: CUSTOMER FOOD & PARCEL LOGIN
            ========================================================================= */}
        {loginMode === "customer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                background: "var(--primary-50)",
                border: "1px solid var(--primary-200)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                fontSize: "0.78rem",
                color: "var(--primary-800)",
                display: "flex",
                flexDirection: "column",
                gap: 3
              }}
            >
              <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} color="var(--primary-600)" /> Customer Direct Access:
              </div>
              <div>• 🍲 <strong>34 Indian Dishes</strong> with descriptions & prices</div>
              <div>• 📦 <strong>Parcel food packing details</strong> & cutlery preferences</div>
              <div>• 💳 <strong>Payment methods</strong>: UPI QR code, Card, or Cash on Pickup</div>
            </div>

            <form onSubmit={handleCustomerSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Priya Nair"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number (For SMS pickup notification)</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon" />
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98450 11234"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Order Type Preference</label>
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
                View Food Menu & Parcel Details <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick 1-Click Customer Logins */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.5rem", textAlign: "center" }}>
                Or 1-Click Fast Login As Regular Customer
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
          </div>
        )}

        {/* =========================================================================
            MODE 2: STAFF & ADMIN LOGIN
            ========================================================================= */}
        {loginMode === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <form onSubmit={handleStaffSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Staff Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@bhojan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 12, color: "var(--charcoal-400)" }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Demo PIN is 1234 for all users.");
                  }}
                  style={{ color: "var(--primary-600)", fontWeight: 600 }}
                >
                  Forgot PIN?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "0.85rem", fontSize: "0.95rem", marginTop: 4 }}
              >
                Sign In to Staff RMS <ArrowRight size={16} />
              </button>
            </form>

            {/* 1-Click Demo Quick Logins */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "0.85rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--charcoal-400)", marginBottom: "0.5rem", textAlign: "center" }}>
                1-Click Quick Role Login
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {staff.slice(0, 4).map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleQuickRoleLogin(member)}
                    style={{
                      padding: "0.6rem 0.75rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-light)",
                      background: "var(--charcoal-50)",
                      textAlign: "left",
                      transition: "all 150ms",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--charcoal-900)" }}>
                      {member.name.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--primary-600)", fontWeight: 600 }}>
                      {member.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
