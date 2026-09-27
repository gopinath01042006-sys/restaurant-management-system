import React, { useState } from "react";
import { useRestaurant } from "../../context/RestaurantContext";
import { StatusBadge } from "../common/Badge";
import { CreateReservationModal } from "./CreateReservationModal";
import { formatDate, formatTime } from "../../utils/formatters";
import {
  CalendarDays,
  List,
  Plus,
  Search,
  Users,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Utensils
} from "lucide-react";

export const ReservationsView = ({ onOpenCreateOrder }) => {
  const { reservations, updateReservationStatus, tables } = useRestaurant();

  const [viewMode, setViewMode] = useState("calendar"); // calendar, list
  const [calendarViewType, setCalendarViewType] = useState("day"); // day, week, month
  const [selectedDate, setSelectedDate] = useState("2026-09-27");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    if (statusFilter !== "all" && res.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = res.customerName.toLowerCase().includes(q);
      const matchPhone = res.phone?.includes(q);
      const matchTable = res.tableId?.toLowerCase().includes(q);
      const matchId = res.id.toLowerCase().includes(q);
      return matchName || matchPhone || matchTable || matchId;
    }
    return true;
  });

  // Calendar reservations for selected date
  const dayReservations = filteredReservations.filter((r) => r.date === selectedDate);

  // Time slots for Day Calendar view
  const timeSlots = [
    "12:00", "12:30", "13:00", "13:30", "14:00",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
  ];

  const handleSeatCustomer = (res) => {
    updateReservationStatus(res.id, "Seated");
    if (res.tableId && onOpenCreateOrder) {
      if (window.confirm(`Customer seated at Table ${res.tableId}. Open order creation for this table?`)) {
        onOpenCreateOrder(res.tableId);
      }
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Table Reservations</h1>
          <p className="page-subtitle">Schedule dining bookings, manage guest arrivals, and prevent double bookings.</p>
        </div>
        <div className="page-actions">
          {/* View toggle */}
          <div style={{ display: "flex", background: "var(--charcoal-50)", padding: 3, borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
            <button
              className={`btn btn-sm ${viewMode === "calendar" ? "btn-primary" : "btn-secondary"}`}
              style={{ border: "none", boxShadow: "none" }}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays size={15} /> Calendar
            </button>
            <button
              className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`}
              style={{ border: "none", boxShadow: "none" }}
              onClick={() => setViewMode("list")}
            >
              <List size={15} /> List View
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} /> Book Reservation
          </button>
        </div>
      </div>

      {/* Filter and date selection bar */}
      <div className="card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          {/* Date Navigator */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Date:</label>
            <input
              type="date"
              className="form-control"
              style={{ width: 170, padding: "0.4rem 0.65rem", fontSize: "0.85rem" }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setSelectedDate("2026-09-27")}
              style={{ fontSize: "0.75rem" }}
            >
              Today
            </button>
          </div>

          {/* Status filters */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            {["all", "Pending", "Confirmed", "Seated", "Completed", "Cancelled"].map((st) => (
              <button
                key={st}
                className={`pill-filter ${statusFilter === st ? "active" : ""}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === "all" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          {/* Search query */}
          <div className="input-with-icon" style={{ width: 220 }}>
            <Search size={15} className="input-icon" />
            <input
              type="text"
              className="form-control"
              style={{ padding: "0.4rem 0.75rem 0.4rem 2.2rem", fontSize: "0.85rem" }}
              placeholder="Search guest or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* View Mode 1: Calendar View */}
      {viewMode === "calendar" && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Day Schedule: {formatDate(selectedDate)}</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--charcoal-500)" }}>
                {dayReservations.length} bookings scheduled for this date
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {["day", "week", "month"].map((mode) => (
                <button
                  key={mode}
                  className={`btn btn-sm ${calendarViewType === mode ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setCalendarViewType(mode)}
                  style={{ textTransform: "capitalize", fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="card-body">
            {calendarViewType === "day" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {timeSlots.map((slot) => {
                  const slotBookings = dayReservations.filter((r) => r.time === slot);
                  const isEvening = parseInt(slot.split(":")[0]) >= 18;

                  return (
                    <div
                      key={slot}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "100px 1fr",
                        borderBottom: "1px solid var(--border-light)",
                        paddingBottom: "0.75rem",
                        alignItems: "flex-start"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isEvening ? "var(--primary-700)" : "var(--charcoal-700)", paddingTop: 4 }}>
                        {formatTime(slot)}
                      </div>

                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", minHeight: 42 }}>
                        {slotBookings.length === 0 ? (
                          <div style={{ fontSize: "0.78rem", color: "var(--charcoal-400)", paddingTop: 6, fontStyle: "italic" }}>
                            No bookings
                          </div>
                        ) : (
                          slotBookings.map((res) => (
                            <div
                              key={res.id}
                              style={{
                                background: res.status === "Seated" ? "#eff6ff" : res.status === "Confirmed" ? "var(--primary-50)" : "#fff",
                                border: `1px solid ${res.status === "Seated" ? "#93c5fd" : "var(--primary-200)"}`,
                                borderRadius: "var(--radius-md)",
                                padding: "0.6rem 0.85rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                                minWidth: 260
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <strong style={{ fontSize: "0.88rem", color: "var(--charcoal-900)" }}>
                                  {res.customerName}
                                </strong>
                                <StatusBadge status={res.status} />
                              </div>

                              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "var(--charcoal-600)" }}>
                                <span><Users size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {res.guests} Guests</span>
                                <span>•</span>
                                <span>Table: <strong>{res.tableId || "Unassigned"}</strong></span>
                              </div>

                              {res.specialRequest && (
                                <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)", fontStyle: "italic" }}>
                                  "{res.specialRequest}"
                                </div>
                              )}

                              <div style={{ display: "flex", gap: "0.35rem", marginTop: 4 }}>
                                {res.status === "Confirmed" && (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}
                                    onClick={() => handleSeatCustomer(res)}
                                  >
                                    <Utensils size={12} /> Seat Guest
                                  </button>
                                )}
                                {res.status === "Pending" && (
                                  <button
                                    className="btn btn-sm btn-success"
                                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem" }}
                                    onClick={() => updateReservationStatus(res.id, "Confirmed")}
                                  >
                                    Confirm
                                  </button>
                                )}
                                {res.status !== "Completed" && res.status !== "Cancelled" && (
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.55rem", color: "var(--danger-600)" }}
                                    onClick={() => updateReservationStatus(res.id, "Cancelled")}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {calendarViewType !== "day" && (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--charcoal-500)" }}>
                <p>Showing overview for current calendar cycle.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginTop: "1rem" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
                    <div key={idx} style={{ background: "var(--charcoal-50)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{day}</div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: 4, color: "var(--primary-600)" }}>
                        {idx === 6 ? dayReservations.length : Math.floor(Math.random() * 8 + 3)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--charcoal-400)" }}>Bookings</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: Table / List View */}
      {viewMode === "list" && (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Res ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: "center" }}>Guests</th>
                  <th>Table</th>
                  <th>Special Request</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--charcoal-400)" }}>
                      No reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((res) => (
                    <tr key={res.id}>
                      <td>
                        <strong style={{ color: "var(--primary-600)" }}>{res.id}</strong>
                      </td>
                      <td>
                        <strong>{res.customerName}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.82rem" }}>{res.phone}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatDate(res.date)}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>{formatTime(res.time)}</div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="badge" style={{ background: "var(--charcoal-100)" }}>
                          {res.guests} Guests
                        </span>
                      </td>
                      <td>
                        <strong>{res.tableId || "Unassigned"}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: "0.78rem", color: "var(--charcoal-600)" }}>
                          {res.specialRequest || "-"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={res.status} />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          {res.status === "Confirmed" && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSeatCustomer(res)}
                              title="Seat customer at table"
                            >
                              <Utensils size={13} /> Seat
                            </button>
                          )}
                          {res.status === "Pending" && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => updateReservationStatus(res.id, "Confirmed")}
                            >
                              Confirm
                            </button>
                          )}
                          {res.status !== "Completed" && res.status !== "Cancelled" && (
                            <button
                              className="btn btn-sm btn-secondary"
                              style={{ color: "var(--danger-600)" }}
                              onClick={() => updateReservationStatus(res.id, "Cancelled")}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
