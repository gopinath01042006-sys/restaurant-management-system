import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { useRestaurant } from "../../context/RestaurantContext";

export const CustomerFormModal = ({ isOpen, onClose, customerToEdit }) => {
  const { addCustomer, updateCustomer } = useRestaurant();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || "");
      setNotes(customerToEdit.notes || "");
    } else {
      setName("");
      setPhone("+91 ");
      setEmail("");
      setNotes("");
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Name and phone number are required.");
      return;
    }

    if (customerToEdit) {
      updateCustomer({
        ...customerToEdit,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim()
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        notes: notes.trim()
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Edit Customer: ${customerToEdit.name}` : "Add New Customer to CRM"}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {customerToEdit ? "Save Changes" : "Save Customer"}
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
            placeholder="e.g. Sunil Gavaskar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
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
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="sunil@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">VIP Notes & Dietary Preferences</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="e.g. VIP guest, likes table 5, allergic to nuts, low spice preference..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </form>
    </Modal>
  );
};
