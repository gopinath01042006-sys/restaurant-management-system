// Formatters and helpers for currency, dates, CSV export, and calculation

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCurrencyDetailed = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatTime = (timeStr) => {
  if (!timeStr) return "-";
  if (timeStr.includes("T")) {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (e) {
      return timeStr;
    }
  }
  return timeStr;
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return `${formatDate(d)} at ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
  } catch (e) {
    return dateStr;
  }
};

// Export to CSV helper
export const downloadCSV = (filename, data, headers) => {
  if (!data || !data.length) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [
    headerLabels.join(","),
    ...data.map((row) =>
      headerKeys
        .map((key) => {
          let val = row[key];
          if (val === null || val === undefined) val = "";
          // Format values with commas or quotes
          const escaped = ("" + val).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    )
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
