import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const Toast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type}`}>
        {toast.type === "error" ? (
          <AlertCircle size={20} className="text-danger-500" />
        ) : (
          <CheckCircle2 size={20} style={{ color: "var(--success-500)" }} />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
