import React, { useState, useEffect } from "react";
import { RestaurantProvider, useRestaurant } from "./context/RestaurantContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { MobileNav } from "./components/layout/MobileNav";
import { GlobalSearchModal } from "./components/layout/GlobalSearchModal";
import { Toast } from "./components/common/Toast";
import { ReceiptModal } from "./components/common/ReceiptModal";

// Views
import { DashboardView } from "./components/dashboard/DashboardView";
import { OrdersView } from "./components/orders/OrdersView";
import { CreateOrderModal } from "./components/orders/CreateOrderModal";
import { OrderDetailModal } from "./components/orders/OrderDetailModal";
import { TablesView } from "./components/tables/TablesView";
import { ReservationsView } from "./components/reservations/ReservationsView";
import { CreateReservationModal } from "./components/reservations/CreateReservationModal";
import { MenuView } from "./components/menu/MenuView";
import { KitchenView } from "./components/kitchen/KitchenView";
import { CustomersView } from "./components/customers/CustomersView";
import { InventoryView } from "./components/inventory/InventoryView";
import { StaffView } from "./components/staff/StaffView";
import { PaymentsView } from "./components/payments/PaymentsView";
import { ProcessPaymentModal } from "./components/payments/ProcessPaymentModal";
import { ReportsView } from "./components/reports/ReportsView";
import { SettingsView } from "./components/settings/SettingsView";
import { LoginView } from "./components/auth/LoginView";
import { CustomerPortal } from "./components/customer/CustomerPortal";

import { hasPermission, getDefaultModuleForRole } from "./utils/permissions";
import { ShieldAlert } from "lucide-react";

const MainAppContent = () => {
  const { currentUser, toast, switchRole } = useRestaurant();

  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [createOrderTableId, setCreateOrderTableId] = useState(null);
  const [createOrderCustomerId, setCreateOrderCustomerId] = useState(null);

  const [isCreateReservationOpen, setIsCreateReservationOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [orderForReceipt, setOrderForReceipt] = useState(null);
  const [orderForPayment, setOrderForPayment] = useState(null);

  // When role changes, if active module is not allowed, switch to default
  useEffect(() => {
    if (currentUser && currentUser.role !== "Customer") {
      if (!hasPermission(currentUser.role, activeModule)) {
        setActiveModule(getDefaultModuleForRole(currentUser.role));
      }
    }
  }, [currentUser, activeModule]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(u) => {
          if (u.role !== "Customer") {
            setActiveModule(getDefaultModuleForRole(u.role));
          }
        }}
      />
    );
  }

  // Render Customer Portal directly when logged in as a Customer
  if (currentUser.role === "Customer") {
    return (
      <>
        <CustomerPortal onSwitchToStaff={() => switchRole("Admin")} />
        <Toast toast={toast} />
      </>
    );
  }

  // Open order creation with table prefilled
  const handleOpenCreateOrder = (tableId = null, customerId = null) => {
    setCreateOrderTableId(tableId);
    setCreateOrderCustomerId(customerId);
    setIsCreateOrderOpen(true);
  };

  const handleOpenCreateReservation = () => {
    setIsCreateReservationOpen(true);
  };

  const handleSelectOrder = (order) => {
    setSelectedOrderForDetail(order);
  };

  const handlePrintReceipt = (order) => {
    setOrderForReceipt(order);
  };

  const handleProcessPayment = (order) => {
    setOrderForPayment(order);
  };

  const isAllowed = hasPermission(currentUser.role, activeModule);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`main-wrapper ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          setActiveModule={setActiveModule}
        />

        {/* View Router */}
        <main style={{ flex: 1 }}>
          {!isAllowed ? (
            <div className="page-container">
              <div className="state-container">
                <div className="state-icon" style={{ background: "var(--danger-50)", color: "var(--danger-600)" }}>
                  <ShieldAlert size={32} />
                </div>
                <h2 className="state-title">Access Restricted</h2>
                <p className="state-desc">
                  Your current role (<strong>{currentUser.role}</strong>) does not have administrative permission to view the{" "}
                  <strong>{activeModule}</strong> module.
                </p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveModule(getDefaultModuleForRole(currentUser.role))}
                >
                  Return to Allowed Workflows
                </button>
              </div>
            </div>
          ) : (
            <>
              {activeModule === "dashboard" && (
                <DashboardView
                  onOpenCreateOrder={() => handleOpenCreateOrder()}
                  onOpenCreateReservation={handleOpenCreateReservation}
                  setActiveModule={setActiveModule}
                  onSelectOrder={handleSelectOrder}
                />
              )}
              {activeModule === "orders" && (
                <OrdersView
                  onOpenCreateOrder={() => handleOpenCreateOrder()}
                  onSelectOrder={handleSelectOrder}
                  onPrintReceipt={handlePrintReceipt}
                  onProcessPayment={handleProcessPayment}
                />
              )}
              {activeModule === "tables" && (
                <TablesView
                  onOpenCreateOrder={(tblId) => handleOpenCreateOrder(tblId)}
                  onSelectOrder={handleSelectOrder}
                />
              )}
              {activeModule === "reservations" && (
                <ReservationsView
                  onOpenCreateOrder={(tblId) => handleOpenCreateOrder(tblId)}
                />
              )}
              {activeModule === "menu" && <MenuView />}
              {activeModule === "kitchen" && <KitchenView />}
              {activeModule === "customers" && (
                <CustomersView
                  onOpenCreateOrder={(tblId, custId) => handleOpenCreateOrder(tblId, custId)}
                  onSelectOrder={handleSelectOrder}
                />
              )}
              {activeModule === "inventory" && <InventoryView />}
              {activeModule === "staff" && <StaffView />}
              {activeModule === "payments" && (
                <PaymentsView onPrintReceipt={handlePrintReceipt} />
              )}
              {activeModule === "reports" && <ReportsView />}
              {activeModule === "settings" && <SettingsView />}
            </>
          )}
        </main>

        {/* Mobile bottom thumb navigation */}
        <MobileNav activeModule={activeModule} setActiveModule={setActiveModule} />
      </div>

      {/* Global Shared Modals */}
      {isCreateOrderOpen && (
        <CreateOrderModal
          isOpen={isCreateOrderOpen}
          onClose={() => setIsCreateOrderOpen(false)}
          initialTableId={createOrderTableId}
          initialCustomerId={createOrderCustomerId}
        />
      )}

      {isCreateReservationOpen && (
        <CreateReservationModal
          isOpen={isCreateReservationOpen}
          onClose={() => setIsCreateReservationOpen(false)}
        />
      )}

      {selectedOrderForDetail && (
        <OrderDetailModal
          isOpen={!!selectedOrderForDetail}
          onClose={() => setSelectedOrderForDetail(null)}
          order={selectedOrderForDetail}
          onPrintReceipt={handlePrintReceipt}
          onProcessPayment={handleProcessPayment}
        />
      )}

      {orderForReceipt && (
        <ReceiptModal
          isOpen={!!orderForReceipt}
          onClose={() => setOrderForReceipt(null)}
          order={orderForReceipt}
        />
      )}

      {orderForPayment && (
        <ProcessPaymentModal
          isOpen={!!orderForPayment}
          onClose={() => setOrderForPayment(null)}
          order={orderForPayment}
        />
      )}

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveModule={setActiveModule}
        onSelectOrder={handleSelectOrder}
      />

      {/* Live Toast Alerts */}
      <Toast toast={toast} />
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
