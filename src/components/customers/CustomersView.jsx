import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { CustomerProfileModal } from "./CustomerProfileModal";
import { CustomerFormModal } from "./CustomerFormModal";
import { Users, Search, Plus, Eye, Edit2, Phone, Mail, Award, Download } from "lucide-react";
import { downloadCSV } from "../../utils/formatters";

export const CustomersView = ({ onOpenCreateOrder, onSelectOrder }) => {
  const { customers } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail;
    }
    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredCustomers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || "-",
      totalOrders: c.totalOrders,
      totalSpend: c.totalSpend,
      lastVisit: c.lastVisit,
      favorites: (c.favoriteItems || []).join("; ")
    }));

    downloadCSV("restaurant_customers_crm", exportData, {
      id: "Customer ID",
      name: "Full Name",
      phone: "Phone",
      email: "Email",
      totalOrders: "Total Orders",
      totalSpend: "Total Spend (INR)",
      lastVisit: "Last Visit Date",
      favorites: "Favorite Dishes"
    });
  };

  const handleOpenProfile = (cust) => {
    setSelectedCustomer(cust);
    setIsProfileModalOpen(true);
  };

  const handleEdit = (cust) => {
    setCustomerToEdit(cust);
    setIsFormModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Customer Relationship (CRM)</h1>
          <p className="page-subtitle">Track diner profiles, dining history, lifetime spending, and dietary preferences.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CRM
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setCustomerToEdit(null);
              setIsFormModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
          <div className="input-with-icon" style={{ flex: 1, maxWidth: 400 }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer name, phone number, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--charcoal-500)", fontWeight: 600 }}>
            {filteredCustomers.length} Diners Found
          </span>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Diner Name</th>
                <th>Contact Details</th>
                <th style={{ textAlign: "center" }}>Orders Count</th>
                <th>Lifetime Spend</th>
                <th>Last Visit</th>
                <th>Favorite Dishes</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--charcoal-400)" }}>
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id}>
                    <td>
                      <strong style={{ color: "var(--primary-600)" }}>{cust.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--charcoal-900)" }}>{cust.name}</div>
                      {cust.notes && (
                        <div style={{ fontSize: "0.72rem", color: "var(--charcoal-400)", fontStyle: "italic" }}>
                          {cust.notes.slice(0, 36)}...
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cust.phone}</div>
                      {cust.email && <div style={{ fontSize: "0.72rem", color: "var(--charcoal-400)" }}>{cust.email}</div>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className="badge" style={{ background: "var(--charcoal-100)" }}>
                        {cust.totalOrders} Visits
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--charcoal-900)" }}>{formatCurrency(cust.totalSpend)}</strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--charcoal-600)" }}>
                        {formatDate(cust.lastVisit)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 220 }}>
                        {(cust.favoriteItems || []).map((fav, idx) => (
                          <span key={idx} className="badge" style={{ background: "var(--primary-50)", color: "var(--primary-700)", fontSize: "0.7rem", padding: "2px 6px" }}>
                            {fav}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleOpenProfile(cust)}
                          title="View 360 profile"
                        >
                          <Eye size={13} /> View Profile
                        </button>
                        <button
                          className="icon-btn"
                          style={{ width: 32, height: 32 }}
                          onClick={() => handleEdit(cust)}
                          title="Edit contact info"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {isProfileModalOpen && (
        <CustomerProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          customer={selectedCustomer}
          onOpenCreateOrder={onOpenCreateOrder}
          onSelectOrder={onSelectOrder}
        />
      )}

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        customerToEdit={customerToEdit}
      />
    </div>
  );
};
