import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const StaffModal = ({ isOpen, onClose, staffToEdit }) => {
  const { addStaff, updateStaff } = useRestaurant();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Waiter");
  const [shift, setShift] = useState("Evening");
  const [pin, setPin] = useState("1234");

  useEffect(() => {
    if (staffToEdit) {
      setName(staffToEdit.name);
      setEmail(staffToEdit.email);
      setPhone(staffToEdit.phone);
      setRole(staffToEdit.role);
      setShift(staffToEdit.shift || "Evening");
      setPin(staffToEdit.pin || "1234");
    } else {
      setName("");
      setEmail("");
      setPhone("+91 ");
      setRole("Waiter");
      setShift("Evening");
      setPin("1234");
    }
  }, [staffToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      alert("Please provide the required staff details.");
      return;
    }

    if (staffToEdit) {
      updateStaff({
        ...staffToEdit,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        shift,
        pin
      });
    } else {
      addStaff({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        shift,
        pin
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staffToEdit ? `Edit Staff: ${staffToEdit.name}` : "Add New Staff Member"}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {staffToEdit ? "Save Changes" : "Save Staff"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="form-group">
          <label className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="rahul@bhojan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="+91 98765 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assigned Role</label>
            <select
              className="form-control form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin / Owner (Full Access)</option>
              <option value="Manager">Manager (Operations & Analytics)</option>
              <option value="Cashier">Cashier (POS & Billing)</option>
              <option value="Kitchen Staff">Kitchen Staff (KDS Prep)</option>
              <option value="Waiter">Waiter (Tables & Orders)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Assigned Shift</label>
            <select
              className="form-control form-select"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              <option value="Morning">Morning Shift (10 AM - 5 PM)</option>
              <option value="Evening">Evening Shift (5 PM - 12 AM)</option>
              <option value="Full Day">Full Day / General</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Quick POS PIN (4 Digits)</label>
          <input
            type="password"
            maxLength="4"
            className="form-control"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
