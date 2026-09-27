import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { Settings, Save, RotateCcw, ShieldAlert, CheckCircle2, Building, DollarSign, Clock } from "lucide-react";

export const SettingsView = () => {
  const { settings, setSettings, resetDemoData, showToast } = useRestaurant();

  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState("general"); // general, taxes, hours, system

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSettings(formData);
    showToast("Restaurant settings saved successfully!");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Restaurant Configuration & Settings</h1>
          <p className="page-subtitle">Manage business profile, GST tax rates, operational hours, and system data.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: "1.5rem", padding: "0.85rem 1.25rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { id: "general", label: "🏢 Business Profile" },
            { id: "taxes", label: "🧾 Taxes & Charges (GST)" },
            { id: "hours", label: "🕒 Operational Hours" },
            { id: "system", label: "⚠️ System & Data Management" }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`pill-filter ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* Tab 1: General Business Profile */}
        {activeTab === "general" && (
          <div className="card" style={{ padding: "1.5rem", maxWidth: 800 }}>
            <h2 className="card-title" style={{ marginBottom: "1.25rem" }}>Business Identity & Contact</h2>
            <div className="form-group">
              <label className="form-label">Restaurant Trade Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.restaurantName}
                onChange={(e) => handleChange("restaurantName", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Tagline</label>
              <input
                type="text"
                className="form-control"
                value={formData.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Official Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Official Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Physical Address</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GSTIN Identification Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.gstin}
                  onChange={(e) => handleChange("gstin", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">FSSAI Food License Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fssaiNumber}
                  onChange={(e) => handleChange("fssaiNumber", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Taxes & Charges */}
        {activeTab === "taxes" && (
          <div className="card" style={{ padding: "1.5rem", maxWidth: 800 }}>
            <h2 className="card-title" style={{ marginBottom: "1.25rem" }}>Taxes & POS Surcharges</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">CGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.cgstRate}
                  onChange={(e) => handleChange("cgstRate", Number(e.target.value))}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--charcoal-500)", marginTop: 2 }}>
                  Central Goods & Services Tax (India standard: 2.5% for restaurants)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">SGST Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.sgstRate}
                  onChange={(e) => handleChange("sgstRate", Number(e.target.value))}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--charcoal-500)", marginTop: 2 }}>
                  State Goods & Services Tax (India standard: 2.5% for restaurants)
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Service Charge on Dine-in (%)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.serviceChargeRate}
                  onChange={(e) => handleChange("serviceChargeRate", Number(e.target.value))}
                />
                <span style={{ fontSize: "0.72rem", color: "var(--charcoal-500)", marginTop: 2 }}>
                  Optional discretionary service charge added exclusively to Dine-in orders
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Order Reference Prefix</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.orderPrefix}
                  onChange={(e) => handleChange("orderPrefix", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Operational Hours */}
        {activeTab === "hours" && (
          <div className="card" style={{ padding: "1.5rem", maxWidth: 800 }}>
            <h2 className="card-title" style={{ marginBottom: "1.25rem" }}>Kitchen & Dining Operational Hours</h2>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Daily Opening Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.openingTime}
                  onChange={(e) => handleChange("openingTime", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Order / Closing Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.closingTime}
                  onChange={(e) => handleChange("closingTime", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Data Management */}
        {activeTab === "system" && (
          <div className="card" style={{ padding: "1.5rem", maxWidth: 800 }}>
            <h2 className="card-title" style={{ marginBottom: "0.5rem" }}>System Factory Reset</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--charcoal-600)", marginBottom: "1.5rem" }}>
              Restore the pristine Indian dining demonstration dataset (34 dishes, 20 customers, 16 tables, 20 reservations, inventory, and orders).
            </p>

            <div style={{ background: "var(--danger-50)", border: "1px solid #fecaca", borderRadius: "var(--radius-md)", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ color: "var(--danger-600)" }}>Reset All System Data</strong>
                <p style={{ fontSize: "0.78rem", color: "var(--charcoal-600)", marginTop: 2 }}>
                  Clears local storage state and reloads initial sample data.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all data to default sample state?")) {
                    resetDemoData();
                  }
                }}
              >
                <RotateCcw size={14} /> Reset Demo Data
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.25rem" }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
