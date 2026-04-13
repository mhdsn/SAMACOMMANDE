import { useState, useEffect } from "react";
import { COLORS, FONT } from "./constants/theme";
import { supabase } from "./services/supabase";
import useOrders from "./hooks/useOrders";
import usePlan from "./hooks/usePlan";
import useSettings from "./hooks/useSettings";
import useMediaQuery from "./hooks/useMediaQuery";
import { LandingPage } from "./components/Landing";
import { LoginPage } from "./components/Auth";
import { Sidebar, PageHeader } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { OrdersTable, NewOrderForm } from "./components/Orders";
import { AIAssistant } from "./components/AI";
import { PricingPage } from "./components/Pricing";
import { SettingsPage } from "./components/Settings";
import { AdminPage } from "./components/Admin";
import { Modal } from "./components/UI";

export default function App() {
  const [page, setPage] = useState("loading"); // start with loading until we check session
  const [session, setSession] = useState(null);

  // Listen to Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setPage(s ? "app" : "landing");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setPage(s ? "app" : "landing");
      }
    );

    return () => subscription.unsubscribe();
  }, []);
  const [view, setView] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile, isTablet } = useMediaQuery();

  // All hooks must be called before any early return (React rules of hooks)
  const {
    orders,
    filtered,
    recentOrders,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    addOrder,
    changeStatus,
    deleteOrder,
  } = useOrders();

  const userId = session?.user?.id;
  const { planId, plan, isPro, switchPlan, canAddOrder, canAddItem, limits } = usePlan(userId);
  const {
    settings,
    draft: settingsDraft,
    hasChanges: settingsChanged,
    saving: settingsSaving,
    errorMsg: settingsError,
    updateDraft: updateSettingsDraft,
    saveSettings,
    discardChanges: discardSettings,
    resetSettings,
  } = useSettings(userId);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("dashboard");
  };

  // ── Loading state ──
  if (page === "loading") {
    return (
      <div
        style={{
          fontFamily: FONT.family,
          minHeight: "100vh",
          background: COLORS.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.textMuted,
          fontSize: 15,
        }}
      >
        Chargement...
      </div>
    );
  }

  // ── Landing / Login pages ──
  if (page === "landing") {
    return (
      <LandingPage
        onLogin={() => setPage("login")}
        onStart={() => setPage("login")}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        onBack={() => setPage("landing")}
      />
    );
  }

  // ── Main app ──
  const handleNewOrder = (draft) => {
    addOrder(draft);
    setModalOpen(false);
  };

  const handleNavigate = (v) => {
    setView(v);
    if (isMobile) setSidebarOpen(false);
  };

  const goToPricing = () => setView("pricing");

  const handleOpenNewOrder = () => {
    if (!canAddOrder(orders.length)) {
      setView("pricing");
      return;
    }
    setModalOpen(true);
  };

  // Only the owner email gets admin access
  const ADMIN_EMAIL = "senemouhamed27@gmail.com";
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const viewTitles = {
    dashboard: "Tableau de bord",
    orders: "Commandes",
    ai: "Assistant IA",
    settings: "Paramètres",
    pricing: "Tarifs",
    admin: "Administration",
  };

  const sidebarWidth = isTablet ? 200 : 260;

  return (
    <div
      style={{
        fontFamily: FONT.family,
        background: COLORS.bg,
        backgroundImage:
          "radial-gradient(ellipse at 15% 50%, rgba(212,98,43,0.04) 0%, transparent 50%), radial-gradient(ellipse at 85% 15%, rgba(37,99,235,0.03) 0%, transparent 50%), radial-gradient(ellipse at 50% 85%, rgba(27,125,70,0.02) 0%, transparent 40%)",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        color: COLORS.text,
      }}
    >
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,22,18,0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 99,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      <Sidebar
        activeView={view}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        orderCount={orders.length}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={sidebarWidth}
        planId={planId}
        isPro={isPro}
        maxOrders={plan.limits.maxOrders}
        isAdmin={isAdmin}
      />

      <div
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
          padding: isMobile ? "20px 16px" : isTablet ? "28px 24px" : "32px 40px",
          minHeight: "100vh",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <PageHeader
          title={viewTitles[view]}
          onNewOrder={handleOpenNewOrder}
          onMenuToggle={() => setSidebarOpen(true)}
          isMobile={isMobile}
          showNewOrder={view !== "ai" && view !== "pricing" && view !== "settings" && view !== "admin"}
        />

        <div style={{ animation: "fadeInUp 0.3s ease" }}>
          {view === "dashboard" && (
            <Dashboard
              orders={orders}
              recentOrders={recentOrders}
              isMobile={isMobile}
              isTablet={isTablet}
              isPro={isPro}
              onUpgrade={goToPricing}
            />
          )}

          {view === "orders" && (
            <OrdersTable
              orders={filtered}
              search={search}
              onSearchChange={setSearch}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              onStatusChange={changeStatus}
              isMobile={isMobile}
              isPro={isPro}
              onUpgrade={goToPricing}
              settings={settings}
              allOrders={orders}
            />
          )}

          {view === "ai" && (
            <AIAssistant orders={orders} isMobile={isMobile} />
          )}

          {view === "settings" && (
            <SettingsPage
              draft={settingsDraft}
              hasChanges={settingsChanged}
              saving={settingsSaving}
              errorMsg={settingsError}
              onUpdate={updateSettingsDraft}
              onSave={saveSettings}
              onDiscard={discardSettings}
              onReset={resetSettings}
              isPro={isPro}
              onUpgrade={goToPricing}
              isMobile={isMobile}
            />
          )}

          {view === "pricing" && (
            <PricingPage
              currentPlan={planId}
              onSwitch={switchPlan}
              isMobile={isMobile}
            />
          )}

          {view === "admin" && isAdmin && (
            <AdminPage
              orders={orders}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouvelle commande"
        isMobile={isMobile}
      >
        <NewOrderForm
          onSubmit={handleNewOrder}
          onCancel={() => setModalOpen(false)}
          isPro={isPro}
          maxItems={plan.limits.maxItemsPerOrder}
          onUpgrade={goToPricing}
          existingOrders={orders}
          isMobile={isMobile}
        />
      </Modal>
    </div>
  );
}
