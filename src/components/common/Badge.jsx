import React from "react";

export const StatusBadge = ({ status }) => {
  const norm = (status || "").toLowerCase().replace(/[\s-_]+/g, "");

  let badgeClass = "status-new";
  let label = status;

  switch (norm) {
    case "available":
      badgeClass = "status-available";
      break;
    case "occupied":
      badgeClass = "status-occupied";
      break;
    case "reserved":
      badgeClass = "status-reserved";
      break;
    case "cleaning":
      badgeClass = "status-cleaning";
      break;
    case "new":
      badgeClass = "status-new";
      break;
    case "confirmed":
    case "accepted":
      badgeClass = "status-occupied";
      break;
    case "preparing":
      badgeClass = "status-preparing";
      break;
    case "ready":
      badgeClass = "status-ready";
      break;
    case "served":
    case "completed":
    case "paid":
    case "active":
    case "instock":
      badgeClass = "status-available";
      break;
    case "cancelled":
    case "failed":
    case "noshow":
    case "inactive":
    case "outofstock":
      badgeClass = "status-cancelled";
      break;
    case "pending":
    case "lowstock":
    case "onleave":
      badgeClass = "status-cleaning";
      break;
    default:
      badgeClass = "status-new";
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot-indicator"></span>
      {label}
    </span>
  );
};

export const VegBadge = ({ isVeg }) => {
  return isVeg ? (
    <span className="badge badge-veg" title="Vegetarian">
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
      VEG
    </span>
  ) : (
    <span className="badge badge-non-veg" title="Non-Vegetarian">
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>
      NON-VEG
    </span>
  );
};
