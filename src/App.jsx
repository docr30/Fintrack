import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useCategories } from "./hooks/useCategories";
import { useTransactions } from "./hooks/useTransactions";
import { useBudgeting } from "./hooks/useBudgeting";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Budgeting from "./pages/Budgeting";
import Profile from "./pages/Profile";
import { PAPER, NAVY } from "./lib/constants";
import FinTrackMark from "./components/FinTrackMark";

function AppInner() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("dashboard");
  const [showTxModal, setShowTxModal] = useState(false);

  const cats = useCategories(user?.id);
  const txs = useTransactions(user?.id);
  const budget = useBudgeting(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: PAPER }}>
        <FinTrackMark size={40} />
        <div className="text-sm text-slate-500">Memuat FinTrack...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Layout view={view} setView={setView} onAddTransaction={() => setShowTxModal(true)}>
      {view === "dashboard" && <Dashboard categories={cats.categories} transactions={txs.transactions} />}
      {view === "transactions" && (
        <Transactions
          categories={cats.categories}
          transactions={txs.transactions}
          onAdd={txs.addTransaction}
          onDelete={txs.deleteTransaction}
          showModal={showTxModal}
          setShowModal={setShowTxModal}
        />
      )}
      {view === "reports" && <Reports categories={cats.categories} transactions={txs.transactions} />}
      {view === "categories" && (
        <Categories
          categories={cats.categories}
          onAdd={cats.addCategory}
          onUpdate={cats.updateCategory}
          onDelete={cats.deleteCategory}
        />
      )}
      {view === "budgeting" && (
        <Budgeting
          categories={cats.categories}
          plans={budget.plans}
          items={budget.items}
          onAddPlan={budget.addPlan}
          onUpdatePlan={budget.updatePlan}
          onDeletePlan={budget.deletePlan}
          onAddItem={budget.addItem}
          onDeleteItem={budget.deleteItem}
        />
      )}
      {view === "profile" && <Profile />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
