import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatDate } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";
import { StaffModal } from "./StaffModal";
import { UserCog, Plus, Search, ShieldCheck, Key, Edit2, Power, UserCheck } from "lucide-react";

export const StaffView = () => {
  const { staff, toggleStaffStatus, switchRole } = useRestaurant();

  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);

  const filteredStaff = staff.filter((s) => {
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchEmail = s.email.toLowerCase().includes(q);
      const matchRole = s.role.toLowerCase().includes(q);
      return matchName || matchEmail || matchRole;
    }
    return true;
  });

  const roles = ["all", "Admin", "Manager", "Cashier", "Kitchen Staff", "Waiter"];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Staff & Access Control</h1>
          <p className="page-subtitle">Manage employee shifts, role-based module permissions, and access credentials.</p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setStaffToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Role filter strip */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {roles.map((r) => (
              <button
                key={r}
                className={`pill-filter ${roleFilter === r ? "active" : ""}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
          </div>

          <div className="input-with-icon" style={{ width: 260 }}>
            <Search size={15} className="input-icon" />
            <input
              type="text"
              className="form-control"
              style={{ padding: "0.4rem 0.75rem 0.4rem 2.2rem", fontSize: "0.85rem" }}
              placeholder="Search staff by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}
      >
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="card"
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: `4px solid ${
                member.role === "Admin"
                  ? "var(--primary-600)"
                  : member.role === "Manager"
                  ? "#3b82f6"
                  : member.role === "Kitchen Staff"
                  ? "#10b981"
                  : "var(--charcoal-400)"
              }`
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius-full)",
                      background: "var(--charcoal-800)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1rem"
                    }}
                  >
                    {member.avatar || member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--charcoal-900)" }}>
                      {member.name}
                    </h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: 700 }}>
                      {member.role}
                    </div>
                  </div>
                </div>

                <StatusBadge status={member.status} />
              </div>

              {/* Details list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: "0.82rem", color: "var(--charcoal-600)", marginBottom: "1rem", background: "var(--charcoal-50)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>
                <div>Email: <strong>{member.email}</strong></div>
                <div>Phone: <strong>{member.phone}</strong></div>
                <div>Shift: <strong>{member.shift || "General"}</strong></div>
                <div>Joined: <span>{formatDate(member.joinedDate)}</span></div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => switchRole(member.role)}
                title="Switch active session into this role"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
              >
                <UserCheck size={13} /> Test View
              </button>

              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button
                  className="icon-btn"
                  style={{ width: 32, height: 32 }}
                  onClick={() => {
                    setStaffToEdit(member);
                    setIsModalOpen(true);
                  }}
                  title="Edit staff details"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}
                  onClick={() => toggleStaffStatus(member.id)}
                  title="Toggle status"
                >
                  <Power size={12} /> {member.status === "Active" ? "Leave" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Modal */}
      <StaffModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
      />
    </div>
  );
};
