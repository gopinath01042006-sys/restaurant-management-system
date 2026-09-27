import React, { createContext, useContext, useState, useEffect } from "react";
import {
  INITIAL_SETTINGS,
  MENU_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_STAFF,
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS
} from "../data/initialData";

const RestaurantContext = createContext();

const STORAGE_KEY = "bhojan_rms_state_v2";

export const RestaurantProvider = ({ children }) => {
  // Load state from localStorage or initial fallback
  const getSaved = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.error("Storage load error:", e);
      return fallback;
    }
  };

  const [settings, setSettings] = useState(() => getSaved("settings", INITIAL_SETTINGS));
  const [categories] = useState(MENU_CATEGORIES);
  const [menuItems, setMenuItems] = useState(() => getSaved("menuItems", INITIAL_MENU_ITEMS));
  const [tables, setTables] = useState(() => getSaved("tables", INITIAL_TABLES));
  const [customers, setCustomers] = useState(() => getSaved("customers", INITIAL_CUSTOMERS));
  const [reservations, setReservations] = useState(() => getSaved("reservations", INITIAL_RESERVATIONS));
  const [orders, setOrders] = useState(() => getSaved("orders", INITIAL_ORDERS));
  const [inventory, setInventory] = useState(() => getSaved("inventory", INITIAL_INVENTORY));
  const [staff, setStaff] = useState(() => getSaved("staff", INITIAL_STAFF));
  const [payments, setPayments] = useState(() => getSaved("payments", INITIAL_PAYMENTS));
  const [notifications, setNotifications] = useState(() => getSaved("notifications", INITIAL_NOTIFICATIONS));

  // Current authenticated user & active role
  // Default to Admin so all features are visible initially, but user can switch anytime
  const [currentUser, setCurrentUser] = useState(() =>
    getSaved("currentUser", {
      id: "STF-01",
      name: "Aditya Singhal",
      email: "aditya.admin@bhojan.com",
      role: "Admin",
      avatar: "AS"
    })
  );

  // Active toast message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_menuItems`, JSON.stringify(menuItems));
      localStorage.setItem(`${STORAGE_KEY}_tables`, JSON.stringify(tables));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(reservations));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
      localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }, [settings, menuItems, tables, customers, reservations, orders, inventory, staff, payments, notifications, currentUser]);

  // Add a new notification
  const addNotification = (title, description, type = "order", link = "orders") => {
    const newNotif = {
      id: `NOTIF-${Date.now()}`,
      title,
      description,
      type,
      time: "Just now",
      unread: true,
      link
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // -------------------------------------------------------------
  // ORDERS & CONNECTED WORKFLOWS
  // -------------------------------------------------------------
  const createOrder = (orderData) => {
    const newId = `${settings.orderPrefix || "ORD-"}${1035 + orders.length}`;
    const now = new Date();
    
    // Subtotal
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Discount
    let discountAmount = 0;
    if (orderData.discountType === "percentage") {
      discountAmount = (subtotal * (Number(orderData.discountValue) || 0)) / 100;
    } else if (orderData.discountType === "fixed") {
      discountAmount = Number(orderData.discountValue) || 0;
    }
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    // Taxes
    const cgst = (taxableAmount * (settings.cgstRate || 2.5)) / 100;
    const sgst = (taxableAmount * (settings.sgstRate || 2.5)) / 100;
    const serviceCharge = orderData.type === "Dine-in" ? (taxableAmount * (settings.serviceChargeRate || 5.0)) / 100 : 0;
    const total = Math.round((taxableAmount + cgst + sgst + serviceCharge) * 100) / 100;

    const newOrder = {
      id: newId,
      type: orderData.type,
      tableId: orderData.type === "Dine-in" ? orderData.tableId : null,
      customerId: orderData.customerId || null,
      customerName: orderData.customerName || "Walk-in Guest",
      phone: orderData.phone || "",
      deliveryAddress: orderData.deliveryAddress || "",
      status: "New",
      kitchenStatus: "NEW",
      paymentStatus: orderData.paymentStatus || "Pending",
      paymentMethod: orderData.paymentMethod || "Cash",
      createdAt: now.toISOString(),
      elapsedMinutes: 0,
      items: orderData.items,
      subtotal,
      discountAmount,
      discountType: orderData.discountType || "none",
      discountValue: orderData.discountValue || 0,
      cgst,
      sgst,
      serviceCharge,
      total,
      notes: orderData.notes || ""
    };

    setOrders((prev) => [newOrder, ...prev]);

    // If Dine-in, update table status to Occupied
    if (orderData.type === "Dine-in" && orderData.tableId) {
      setTables((prev) =>
        prev.map((tbl) =>
          tbl.id === orderData.tableId
            ? { ...tbl, status: "Occupied", currentOrderId: newId, customerName: orderData.customerName || "Guest", seatedTime: "Just now" }
            : tbl
        )
      );
    }

    // Update customer stats or add new customer if doesn't exist
    if (orderData.customerName && orderData.phone) {
      setCustomers((prev) => {
        const existing = prev.find((c) => c.phone === orderData.phone || (c.id && c.id === orderData.customerId));
        if (existing) {
          return prev.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  totalOrders: c.totalOrders + 1,
                  totalSpend: c.totalSpend + (orderData.paymentStatus === "Paid" ? total : 0),
                  lastVisit: now.toISOString().split("T")[0]
                }
              : c
          );
        } else {
          const newCust = {
            id: `CUST-0${prev.length + 1}`,
            name: orderData.customerName,
            phone: orderData.phone,
            email: orderData.email || "",
            totalOrders: 1,
            totalSpend: orderData.paymentStatus === "Paid" ? total : 0,
            lastVisit: now.toISOString().split("T")[0],
            favoriteItems: orderData.items.map((i) => i.name).slice(0, 2),
            notes: ""
          };
          return [newCust, ...prev];
        }
      });
    }

    // If pre-paid, record payment
    if (orderData.paymentStatus === "Paid") {
      const txn = {
        id: `TXN-${9000 + payments.length}`,
        orderId: newId,
        customerName: orderData.customerName || "Walk-in Guest",
        amount: total,
        method: orderData.paymentMethod || "Cash",
        status: "Paid",
        timestamp: now.toISOString(),
        referenceNumber: `RMS-${Date.now().toString().slice(-6)}`
      };
      setPayments((prev) => [txn, ...prev]);
    }

    // Add notification
    addNotification(
      `New Order #${newId}`,
      `${orderData.type} order received: ${orderData.items.length} items (${settings.currency}${total})`,
      "order",
      "orders"
    );

    showToast(`Order #${newId} created successfully! Sent to Kitchen.`);
    return newOrder;
  };

  // Update order status & trigger linked changes
  const updateOrderStatus = (orderId, newStatus) => {
    let orderToUpdate = null;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          orderToUpdate = { ...ord, status: newStatus };
          // Keep kitchen status in sync
          if (newStatus === "Preparing") orderToUpdate.kitchenStatus = "PREPARING";
          if (newStatus === "Ready") orderToUpdate.kitchenStatus = "READY";
          if (newStatus === "Served" || newStatus === "Completed") orderToUpdate.kitchenStatus = "SERVED";
          if (newStatus === "Cancelled") orderToUpdate.kitchenStatus = "CANCELLED";
          if (newStatus === "Completed") orderToUpdate.completedAt = new Date().toISOString();
          return orderToUpdate;
        }
        return ord;
      })
    );

    if (orderToUpdate) {
      // If Ready, notify waiter/front desk
      if (newStatus === "Ready") {
        addNotification(
          `Order #${orderId} Ready!`,
          `Items for ${orderToUpdate.type === "Dine-in" ? `Table ${orderToUpdate.tableId}` : orderToUpdate.customerName} are ready to serve.`,
          "kitchen",
          "kitchen"
        );
        showToast(`Order #${orderId} marked as READY to serve!`);
      }

      // If Completed, free the table and set to Cleaning
      if (newStatus === "Completed" && orderToUpdate.tableId) {
        setTables((prev) =>
          prev.map((tbl) =>
            tbl.id === orderToUpdate.tableId
              ? { ...tbl, status: "Cleaning", currentOrderId: null, customerName: null, seatedTime: null }
              : tbl
          )
        );
        showToast(`Order #${orderId} completed! Table marked for cleaning.`);
      }

      // If Cancelled, free table
      if (newStatus === "Cancelled" && orderToUpdate.tableId) {
        setTables((prev) =>
          prev.map((tbl) =>
            tbl.id === orderToUpdate.tableId
              ? { ...tbl, status: "Available", currentOrderId: null, customerName: null, seatedTime: null }
              : tbl
          )
        );
        showToast(`Order #${orderId} cancelled. Table released.`);
      }
    }
  };

  // Kitchen workflow status update
  const updateKitchenStatus = (orderId, kitchenStatus) => {
    let generalStatus = "Preparing";
    if (kitchenStatus === "NEW") generalStatus = "New";
    if (kitchenStatus === "ACCEPTED") generalStatus = "Confirmed";
    if (kitchenStatus === "PREPARING") generalStatus = "Preparing";
    if (kitchenStatus === "READY") generalStatus = "Ready";
    if (kitchenStatus === "SERVED") generalStatus = "Served";

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, kitchenStatus, status: generalStatus } : ord))
    );

    if (kitchenStatus === "READY") {
      addNotification(`Kitchen: Order #${orderId} Ready`, `Dishes are plated and ready on counter.`, "kitchen", "kitchen");
      showToast(`Order #${orderId} marked READY in Kitchen Display!`);
    } else {
      showToast(`Order #${orderId} advanced to ${kitchenStatus}`);
    }
  };

  // Process payment for an existing order
  const processOrderPayment = (orderId, paymentMethod, amountPaid) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const amount = amountPaid || order.total;
    const now = new Date();

    // Update order
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: "Paid",
              paymentMethod,
              status: o.status === "Served" ? "Completed" : o.status,
              completedAt: o.status === "Served" ? now.toISOString() : o.completedAt
            }
          : o
      )
    );

    // If dine-in and order finished, free table
    if (order.tableId) {
      setTables((prev) =>
        prev.map((tbl) =>
          tbl.id === order.tableId
            ? { ...tbl, status: "Cleaning", currentOrderId: null, customerName: null, seatedTime: null }
            : tbl
        )
      );
    }

    // Add payment record
    const txn = {
      id: `TXN-${9000 + payments.length}`,
      orderId: order.id,
      customerName: order.customerName,
      amount,
      method: paymentMethod,
      status: "Paid",
      timestamp: now.toISOString(),
      referenceNumber: `RMS-${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`
    };
    setPayments((prev) => [txn, ...prev]);

    // Update customer spending
    if (order.customerId) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === order.customerId
            ? { ...c, totalSpend: c.totalSpend + amount }
            : c
        )
      );
    }

    addNotification(
      `Payment Received: ${settings.currency}${amount}`,
      `Order #${orderId} paid via ${paymentMethod} (${order.customerName})`,
      "payment",
      "payments"
    );

    showToast(`Payment of ${settings.currency}${amount} completed successfully!`);
  };

  // -------------------------------------------------------------
  // TABLES
  // -------------------------------------------------------------
  const updateTableStatus = (tableId, newStatus) => {
    setTables((prev) =>
      prev.map((tbl) => (tbl.id === tableId ? { ...tbl, status: newStatus } : tbl))
    );
    showToast(`Table ${tableId} status set to ${newStatus}`);
  };

  const addTable = (tableData) => {
    const newTbl = {
      id: tableData.number,
      number: tableData.number,
      section: tableData.section || "Main Hall",
      capacity: Number(tableData.capacity) || 4,
      status: "Available",
      currentOrderId: null,
      customerName: null,
      seatedTime: null
    };
    setTables((prev) => [...prev, newTbl]);
    showToast(`Table ${newTbl.number} added successfully.`);
  };

  const deleteTable = (tableId) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId));
    showToast(`Table ${tableId} deleted.`);
  };

  const moveTableOrder = (fromTableId, toTableId) => {
    const fromTable = tables.find((t) => t.id === fromTableId);
    if (!fromTable || !fromTable.currentOrderId) {
      showToast("Source table does not have an active order", "error");
      return;
    }

    const orderId = fromTable.currentOrderId;
    const customer = fromTable.customerName;

    // Update order
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, tableId: toTableId } : o))
    );

    // Update tables
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === fromTableId) {
          return { ...t, status: "Available", currentOrderId: null, customerName: null, seatedTime: null };
        }
        if (t.id === toTableId) {
          return { ...t, status: "Occupied", currentOrderId: orderId, customerName: customer, seatedTime: fromTable.seatedTime };
        }
        return t;
      })
    );

    showToast(`Transferred Order #${orderId} from ${fromTableId} to ${toTableId}`);
  };

  // -------------------------------------------------------------
  // RESERVATIONS
  // -------------------------------------------------------------
  const createReservation = (resData) => {
    const newRes = {
      id: `RES-${216 + reservations.length}`,
      customerName: resData.customerName,
      phone: resData.phone,
      date: resData.date,
      time: resData.time,
      guests: Number(resData.guests) || 2,
      tableId: resData.tableId || null,
      status: resData.status || "Confirmed",
      specialRequest: resData.specialRequest || ""
    };

    setReservations((prev) => [newRes, ...prev]);

    // If reservation is for today and table is assigned, mark table Reserved
    const todayStr = new Date().toISOString().split("T")[0];
    if (resData.date === todayStr && resData.tableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === resData.tableId && t.status === "Available" ? { ...t, status: "Reserved", customerName: resData.customerName } : t))
      );
    }

    addNotification(
      `Reservation Booked: ${resData.customerName}`,
      `${resData.guests} guests on ${resData.date} at ${resData.time}${resData.tableId ? ` (Table ${resData.tableId})` : ""}`,
      "reservation",
      "reservations"
    );

    showToast(`Reservation #${newRes.id} confirmed for ${resData.customerName}`);
    return newRes;
  };

  const updateReservationStatus = (resId, newStatus) => {
    const res = reservations.find((r) => r.id === resId);
    setReservations((prev) =>
      prev.map((r) => (r.id === resId ? { ...r, status: newStatus } : r))
    );

    if (res && res.tableId) {
      if (newStatus === "Seated") {
        setTables((prev) =>
          prev.map((t) => (t.id === res.tableId ? { ...t, status: "Occupied", customerName: res.customerName, seatedTime: "Just now" } : t))
        );
        showToast(`Customer seated at Table ${res.tableId}!`);
      } else if (newStatus === "Cancelled" || newStatus === "Completed" || newStatus === "No-show") {
        setTables((prev) =>
          prev.map((t) => (t.id === res.tableId && t.status === "Reserved" ? { ...t, status: "Available", customerName: null } : t))
        );
      }
    }
  };

  // -------------------------------------------------------------
  // MENU MANAGEMENT
  // -------------------------------------------------------------
  const addMenuItem = (item) => {
    const newItem = {
      ...item,
      id: `menu-${menuItems.length + 10}`,
      price: Number(item.price) || 0,
      prepTime: Number(item.prepTime) || 15,
      taxRate: Number(item.taxRate) || 5,
      isAvailable: true,
      popular: false
    };
    setMenuItems((prev) => [...prev, newItem]);
    showToast(`Menu item "${item.name}" added successfully.`);
  };

  const updateMenuItem = (item) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? { ...item, price: Number(item.price), prepTime: Number(item.prepTime) } : m)));
    showToast(`Updated "${item.name}"`);
  };

  const deleteMenuItem = (itemId) => {
    const item = menuItems.find((m) => m.id === itemId);
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    showToast(`Deleted item "${item ? item.name : itemId}"`);
  };

  const toggleMenuItemAvailability = (itemId) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  };

  // -------------------------------------------------------------
  // INVENTORY MANAGEMENT
  // -------------------------------------------------------------
  const updateInventoryStock = (itemId, changeAmount, reason = "Stock Adjustment") => {
    setInventory((prev) =>
      prev.map((inv) => {
        if (inv.id === itemId) {
          const newQty = Math.max(0, inv.currentStock + Number(changeAmount));
          const isLow = newQty <= inv.minStock;
          
          if (isLow && !inv.alert) {
            addNotification(
              `Low Stock Alert: ${inv.name}`,
              `Stock reached ${newQty} ${inv.unit} (Min threshold: ${inv.minStock} ${inv.unit})`,
              "stock",
              "inventory"
            );
          }

          return {
            ...inv,
            currentStock: newQty,
            alert: isLow,
            lastUpdated: new Date().toISOString().split("T")[0]
          };
        }
        return inv;
      })
    );
    showToast(`Updated stock for item. Reason: ${reason}`);
  };

  const addInventoryItem = (item) => {
    const newItem = {
      ...item,
      id: `INV-${inventory.length + 1}`,
      currentStock: Number(item.currentStock) || 0,
      minStock: Number(item.minStock) || 10,
      unitCost: Number(item.unitCost) || 0,
      lastUpdated: new Date().toISOString().split("T")[0],
      alert: (Number(item.currentStock) || 0) <= (Number(item.minStock) || 10)
    };
    setInventory((prev) => [...prev, newItem]);
    showToast(`Added inventory item "${item.name}"`);
  };

  const deleteInventoryItem = (itemId) => {
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    showToast("Inventory item deleted.");
  };

  // -------------------------------------------------------------
  // CUSTOMERS CRM
  // -------------------------------------------------------------
  const addCustomer = (cust) => {
    const newCust = {
      ...cust,
      id: `CUST-0${customers.length + 1}`,
      totalOrders: 0,
      totalSpend: 0,
      lastVisit: new Date().toISOString().split("T")[0],
      favoriteItems: []
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer "${cust.name}" added to CRM.`);
    return newCust;
  };

  const updateCustomer = (cust) => {
    setCustomers((prev) => prev.map((c) => (c.id === cust.id ? { ...c, ...cust } : c)));
    showToast(`Updated customer profile.`);
  };

  // -------------------------------------------------------------
  // STAFF MANAGEMENT
  // -------------------------------------------------------------
  const addStaff = (member) => {
    const newStaff = {
      ...member,
      id: `STF-0${staff.length + 1}`,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      avatar: member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    };
    setStaff((prev) => [...prev, newStaff]);
    showToast(`Staff member "${member.name}" added.`);
  };

  const updateStaff = (member) => {
    setStaff((prev) => prev.map((s) => (s.id === member.id ? { ...s, ...member } : s)));
    showToast("Staff updated successfully.");
  };

  const toggleStaffStatus = (staffId) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, status: s.status === "Active" ? "On Leave" : s.status === "On Leave" ? "Inactive" : "Active" }
          : s
      )
    );
  };

  // -------------------------------------------------------------
  // AUTH & ROLE SWITCHING
  // -------------------------------------------------------------
  const switchRole = (newRole) => {
    if (newRole === "Customer") {
      setCurrentUser({
        id: "CUST-002",
        name: "Priya Nair",
        phone: "+91 98450 11234",
        email: "priya.nair@outlook.com",
        role: "Customer",
        avatar: "PN"
      });
      showToast("Switched to Customer Dining & Parcel View");
      return;
    }
    const matchingStaff = staff.find((s) => s.role === newRole) || {
      id: "STF-USER",
      name: `${newRole} User`,
      email: `${newRole.toLowerCase()}@bhojan.com`,
      role: newRole,
      avatar: newRole.slice(0, 2).toUpperCase()
    };
    setCurrentUser(matchingStaff);
    showToast(`Switched active view to ${newRole} role.`);
  };

  const loginUser = (email, password) => {
    // Demo authentication
    const user = staff.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name} (${user.role})!`);
      return { success: true, user };
    }
    // Default fallback
    const defaultUser = {
      id: "STF-01",
      name: "Aditya Singhal",
      email,
      role: "Admin",
      avatar: "AS"
    };
    setCurrentUser(defaultUser);
    showToast(`Logged in as Admin`);
    return { success: true, user: defaultUser };
  };

  const loginCustomer = (customerData) => {
    const customerUser = {
      id: customerData.id || `CUST-${Date.now()}`,
      name: customerData.name || "Guest Customer",
      phone: customerData.phone || "",
      email: customerData.email || "",
      role: "Customer",
      avatar: (customerData.name || "CU").slice(0, 2).toUpperCase(),
      orderPreference: customerData.orderPreference || "Takeaway"
    };
    setCurrentUser(customerUser);
    showToast(`Welcome ${customerUser.name}! Opening Menu & Parcel Counter...`);
    return customerUser;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast("Logged out successfully.");
  };

  // Reset entire application data to factory defaults
  const resetDemoData = () => {
    setSettings(INITIAL_SETTINGS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setCustomers(INITIAL_CUSTOMERS);
    setReservations(INITIAL_RESERVATIONS);
    setOrders(INITIAL_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setStaff(INITIAL_STAFF);
    setPayments(INITIAL_PAYMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser({
      id: "STF-01",
      name: "Aditya Singhal",
      email: "aditya.admin@bhojan.com",
      role: "Admin",
      avatar: "AS"
    });
    localStorage.clear();
    showToast("Application data reset to initial restaurant sample data!");
  };

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        setSettings,
        categories,
        menuItems,
        tables,
        customers,
        reservations,
        orders,
        inventory,
        staff,
        payments,
        notifications,
        currentUser,
        toast,
        showToast,
        // Order Actions
        createOrder,
        updateOrderStatus,
        updateKitchenStatus,
        processOrderPayment,
        // Table Actions
        updateTableStatus,
        addTable,
        deleteTable,
        moveTableOrder,
        // Reservation Actions
        createReservation,
        updateReservationStatus,
        // Menu Actions
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        // Inventory Actions
        updateInventoryStock,
        addInventoryItem,
        deleteInventoryItem,
        // Customer Actions
        addCustomer,
        updateCustomer,
        // Staff Actions
        addStaff,
        updateStaff,
        toggleStaffStatus,
        // Notifications
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
        // Auth
        switchRole,
        loginUser,
        loginCustomer,
        logoutUser,
        setCurrentUser,
        resetDemoData
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
};
