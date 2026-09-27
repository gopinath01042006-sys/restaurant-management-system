import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";
import { Calendar, Clock, Users, User, Phone, MessageSquare } from "lucide-react";

export const CreateReservationModal = ({ isOpen, onClose }) => {
  const { tables, customers, createReservation } = useRestaurant();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("2026-09-27");
  const [time, setTime] = useState("19:30");
  const [guests, setGuests] = useState(4);
  const [tableId, setTableId] = useState("");
  const [status, setStatus] = useState("Confirmed");
  const [specialRequest, setSpecialRequest] = useState("");

  const handleSelectCustomer = (custId) => {
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name);
      setPhone(cust.phone);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !date || !time) {
      alert("Please fill in the required reservation details.");
      return;
    }

    createReservation({
      customerName: customerName.trim(),
      phone: phone.trim(),
      date,
      time,
      guests: Number(guests) || 2,
      tableId: tableId || null,
      status,
      specialRequest: specialRequest.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Dining Reservation"
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Confirm Reservation
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Quick select existing customer */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Existing Customer (Optional)</label>
          <select
            className="form-control form-select"
            onChange={(e) => handleSelectCustomer(e.target.value)}
          >
            <option value="">-- Choose from CRM --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Customer Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Anjali Gupta"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              className="form-control"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Reservation Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Time Slot <span className="required">*</span>
            </label>
            <select
              className="form-control form-select"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            >
              <option value="12:00">12:00 PM (Lunch)</option>
              <option value="12:30">12:30 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="13:30">01:30 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="19:00">07:00 PM (Dinner)</option>
              <option value="19:30">07:30 PM</option>
              <option value="20:00">08:00 PM</option>
              <option value="20:30">08:30 PM</option>
              <option value="21:00">09:00 PM</option>
              <option value="21:30">09:30 PM</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Number of Guests</label>
            <input
              type="number"
              min="1"
              max="30"
              className="form-control"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assign Table (Optional)</label>
            <select
              className="form-control form-select"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
            >
              <option value="">-- Auto-assign on arrival --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.number} ({t.section} • Capacity {t.capacity})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Request / Celebration Notes</label>
          <textarea
            className="form-control"
            rows="2"
            placeholder="e.g. Birthday anniversary, high chair needed, window table..."
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
          ></textarea>
        </div>
      </form>
    </Modal>
  );
};
