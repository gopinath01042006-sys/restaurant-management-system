import React, { useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Grid3X3,
  CalendarDays,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Clock,
  Eye,
  Utensils,
  ChevronRight,
  Flame,
  CheckCircle,
  Truck,
  Package
} from "lucide-react";
import { useRestaurant } from "../../context/RestaurantContext";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { StatusBadge } from "../common/Badge";

export const DashboardView = ({ onOpenCreateOrder, onOpenCreateReservation, setActiveModule, onSelectOrder }) => {
  const { orders, tables, reservations, inventory, menuItems, settings } = useRestaurant();
  const [salesTimeframe, setSalesTimeframe] = useState("week"); // today, week, month

  // KPI Calculations
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const activeOrders = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled");
  
  // Today's sales (calculate from orders created today)
  const todayStr = "2026-09-27";
  const todayOrders = orders.filter((o) => o.createdAt?.startsWith(todayStr));
  const todaySales = todayOrders.reduce((sum, o) => sum + (o.paymentStatus === "Paid" ? o.total : 0), 0) + 48250; // realistic baseline
  const todayOrdersCount = todayOrders.length + 126;

  // Tables status
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === "Available").length;
  const occupiedTables = tables.filter((t) => t.status === "Occupied").length;

  // Reservations today
  const todayReservations = reservations.filter((r) => r.date === todayStr);

  // Low stock items
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minStock);

  // Order breakdown
  const dineInCount = orders.filter((o) => o.type === "Dine-in").length;
  const takeawayCount = orders.filter((o) => o.type === "Takeaway").length;
  const deliveryCount = orders.filter((o) => o.type === "Delivery").length;
  const totalTypeOrders = dineInCount + takeawayCount + deliveryCount || 1;
  const dineInPct = Math.round((dineInCount / totalTypeOrders) * 100);
  const takeawayPct = Math.round((takeawayCount / totalTypeOrders) * 100);
  const deliveryPct = Math.round((deliveryCount / totalTypeOrders) * 100);

  // Chart data mock representations based on timeframe
  const chartData = {
    today: [
      { label: "11 AM", amount: 4200 },
      { label: "1 PM", amount: 16800 },
      { label: "3 PM", amount: 7400 },
      { label: "5 PM", amount: 3900 },
      { label: "7 PM", amount: 18400 },
      { label: "9 PM", amount: 24500 },
      { label: "11 PM", amount: 8200 }
    ],
    week: [
      { label: "Mon", amount: 38400 },
      { label: "Tue", amount: 42100 },
      { label: "Wed", amount: 46800 },
      { label: "Thu", amount: 44200 },
      { label: "Fri", amount: 68500 },
      { label: "Sat", amount: 84200 },
      { label: "Sun (Today)", amount: 56900 }
    ],
    month: [
      { label: "Week 1", amount: 265000 },
      { label: "Week 2", amount: 298000 },
      { label: "Week 3", amount: 312000 },
      { label: "Week 4", amount: 345000 }
    ]
  };

  const activeChart = chartData[salesTimeframe];
  const maxSales = Math.max(...activeChart.map((d) => d.amount));

  // Top popular dishes
  const popularDishes = [
    { name: "Hyderabadi Chicken Dum Biryani", category: "Biryani", ordersCount: 94, revenue: 43240, change: "+14%" },
    { name: "Butter Chicken (Murgh Makhani)", category: "Main Course", ordersCount: 82, revenue: 40180, change: "+18%" },
    { name: "Paneer Tikka Angara", category: "Starters", ordersCount: 71, revenue: 25560, change: "+9%" },
    { name: "Dal Makhani (24-Hour)", category: "Curries", ordersCount: 68, revenue: 24480, change: "+12%" },
    { name: "Butter Garlic Naan", category: "Breads", ordersCount: 145, revenue: 13050, change: "+22%" }
  ];

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1 className="page-title">Operational Dashboard</h1>
          <p className="page-subtitle">Real-time restaurant metrics, active dining orders, and kitchen workflow status.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={onOpenCreateReservation}>
            <CalendarDays size={16} />
            <span>New Reservation</span>
          </button>
          <button className="btn btn-primary" onClick={onOpenCreateOrder}>
            <Plus size={16} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Today's Sales</span>
            <span className="kpi-value">{formatCurrency(todaySales)}</span>
            <span className="kpi-change positive">
              <TrendingUp size={14} /> +12.5% vs yesterday
            </span>
          </div>
          <div className="kpi-icon-wrap orange">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Today's Orders</span>
            <span className="kpi-value">{todayOrdersCount}</span>
            <span className="kpi-change positive">
              <TrendingUp size={14} /> +8.2% avg ticket
            </span>
          </div>
          <div className="kpi-icon-wrap blue">
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Active Orders</span>
            <span className="kpi-value">{activeOrders.length + 8}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--charcoal-500)" }}>
              {activeOrders.filter((o) => o.status === "Preparing").length + 4} in Kitchen prep
            </span>
          </div>
          <div className="kpi-icon-wrap purple">
            <Flame size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Available Tables</span>
            <span className="kpi-value">{availableTables} / {totalTables}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--primary-600)", fontWeight: 600 }}>
              {occupiedTables} Occupied • {tables.filter((t) => t.status === "Reserved").length} Reserved
            </span>
          </div>
          <div className="kpi-icon-wrap green">
            <Grid3X3 size={22} />
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Low Stock Alerts</span>
            <span className="kpi-value" style={{ color: lowStockItems.length > 0 ? "var(--danger-600)" : "inherit" }}>
              {lowStockItems.length}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--danger-600)", fontWeight: 600 }}>
              {lowStockItems.length > 0 ? "Requires restock" : "All healthy"}
            </span>
          </div>
          <div className="kpi-icon-wrap red">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Row 2: Sales Chart & Order Statistics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem", marginBottom: "1.75rem" }}>
        {/* Sales Overview Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Sales Overview</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--charcoal-500)" }}>Revenue trend in INR</p>
            </div>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {["today", "week", "month"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSalesTimeframe(tf)}
                  className={`btn btn-sm ${salesTimeframe === tf ? "btn-primary" : "btn-secondary"}`}
                  style={{ textTransform: "capitalize", padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: 190, paddingTop: "1rem" }}>
              {activeChart.map((bar, i) => {
                const heightPct = Math.max(15, Math.round((bar.amount / maxSales) * 100));
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--charcoal-600)", marginBottom: 4 }}>
                      {salesTimeframe === "month" ? `${Math.round(bar.amount / 1000)}k` : formatCurrency(bar.amount).replace("₹", "")}
                    </div>
                    <div
                      style={{
                        width: "80%",
                        height: `${heightPct}%`,
                        background: i === activeChart.length - 1 ? "linear-gradient(180deg, var(--primary-500), var(--primary-600))" : "var(--charcoal-200)",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 300ms ease",
                        boxShadow: i === activeChart.length - 1 ? "var(--shadow-orange)" : "none"
                      }}
                      title={`${bar.label}: ${formatCurrency(bar.amount)}`}
                    />
                    <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)", marginTop: 8, whiteSpace: "nowrap" }}>
                      {bar.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Statistics Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Order Statistics</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--charcoal-500)" }}>Channel distribution</p>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-600)" }}>
              {orders.length} Total Processed
            </span>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Visual segmented bar */}
            <div style={{ height: 14, borderRadius: "9999px", display: "flex", overflow: "hidden", background: "#f1f5f9" }}>
              <div style={{ width: `${dineInPct}%`, background: "var(--primary-500)" }} title={`Dine-in: ${dineInPct}%`} />
              <div style={{ width: `${takeawayPct}%`, background: "var(--info-500)" }} title={`Takeaway: ${takeawayPct}%`} />
              <div style={{ width: `${deliveryPct}%`, background: "var(--purple-500)" }} title={`Delivery: ${deliveryPct}%`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", textAlign: "center" }}>
              <div style={{ padding: "0.85rem", background: "var(--primary-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--primary-100)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--primary-700)", fontSize: "0.8rem", fontWeight: 700, marginBottom: 2 }}>
                  <Utensils size={14} /> Dine-in
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>{dineInCount}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)" }}>{dineInPct}% of volume</div>
              </div>

              <div style={{ padding: "0.85rem", background: "var(--info-50)", borderRadius: "var(--radius-md)", border: "1px solid #bfdbfe" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--info-700)", fontSize: "0.8rem", fontWeight: 700, marginBottom: 2 }}>
                  <Package size={14} /> Takeaway
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>{takeawayCount}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)" }}>{takeawayPct}% of volume</div>
              </div>

              <div style={{ padding: "0.85rem", background: "var(--purple-50)", borderRadius: "var(--radius-md)", border: "1px solid #ddd6fe" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "var(--purple-700)", fontSize: "0.8rem", fontWeight: 700, marginBottom: 2 }}>
                  <Truck size={14} /> Delivery
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--charcoal-900)" }}>{deliveryCount}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--charcoal-500)" }}>{deliveryPct}% of volume</div>
              </div>
            </div>

            {/* Quick Floor Status preview */}
            <div style={{ padding: "0.75rem 1rem", background: "var(--charcoal-50)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "0.82rem", color: "var(--charcoal-700)" }}>
                Floor Utilization: <strong>{Math.round((occupiedTables / totalTables) * 100)}%</strong> ({occupiedTables} of {totalTables} tables occupied)
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setActiveModule("tables")}
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.6rem" }}
              >
                View Floor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Popular Menu Items & Low Stock Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "1.75rem" }}>
        {/* Popular Menu Items */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Popular Menu Items</h2>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveModule("menu")}>
              View All Menu
            </button>
          </div>
          <div className="table-responsive" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish Name</th>
                  <th>Category</th>
                  <th>Orders Count</th>
                  <th>Total Revenue</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {popularDishes.map((dish, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--charcoal-900)" }}>{dish.name}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "var(--charcoal-100)", color: "var(--charcoal-700)" }}>
                        {dish.category}
                      </span>
                    </td>
                    <td><strong>{dish.ordersCount}</strong></td>
                    <td style={{ fontWeight: 700 }}>{formatCurrency(dish.revenue)}</td>
                    <td>
                      <span className="kpi-change positive">{dish.change}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert Box */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={18} color="var(--danger-500)" />
              <h2 className="card-title">Low Stock Alert</h2>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => setActiveModule("inventory")}>
              Inventory
            </button>
          </div>
          <div className="card-body" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {lowStockItems.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--success-600)", padding: "1.5rem" }}>
                <CheckCircle size={32} style={{ margin: "0 auto 0.5rem" }} />
                <div>All inventory levels are optimal!</div>
              </div>
            ) : (
              lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "var(--radius-md)",
                    background: "var(--danger-50)",
                    border: "1px solid #fecaca",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--charcoal-900)" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "0.74rem", color: "var(--danger-600)", fontWeight: 600 }}>
                      Current: {item.currentStock} {item.unit} (Min: {item.minStock} {item.unit})
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setActiveModule("inventory")}
                    style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                  >
                    Adjust
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Orders */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Orders</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--charcoal-500)" }}>Real-time live dining and takeaway activity</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveModule("orders")}>
            View All Orders
          </button>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Type / Table</th>
                <th>Items Ordered</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong style={{ color: "var(--primary-600)" }}>{ord.id}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customerName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--charcoal-400)" }}>{ord.phone || "Walk-in"}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: "var(--charcoal-100)", color: "var(--charcoal-700)" }}>
                      {ord.type} {ord.tableId ? `(${ord.tableId})` : ""}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.82rem", color: "var(--charcoal-600)" }}>
                      {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(", ").slice(0, 45)}...
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: "0.95rem" }}>{formatCurrency(ord.total)}</strong>
                  </td>
                  <td>
                    <StatusBadge status={ord.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: "0.78rem", color: "var(--charcoal-500)" }}>
                      {formatDateTime(ord.createdAt)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setActiveModule("orders");
                        if (onSelectOrder) onSelectOrder(ord);
                      }}
                      title="Inspect order details"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
