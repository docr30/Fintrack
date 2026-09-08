import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: true })
      .range(0, 4999);
    if (!err) {
      setTransactions(data || []);
      setError(null);
    } else {
      setError(err);
      console.error("Gagal memuat transaksi:", err);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addTransaction(tx) {
    const { error: err } = await supabase.from("transactions").insert([{
      date: tx.date,
      category_id: tx.category_id,
      item: tx.item,
      amount: tx.amount,
      type: tx.type,
      user_id: userId,
    }]);
    if (!err) await refresh();
    return err;
  }

  async function updateTransaction(id, tx) {
    const { error: err } = await supabase
      .from("transactions")
      .update({
        date: tx.date,
        category_id: tx.category_id,
        item: tx.item,
        amount: tx.amount,
        type: tx.type,
      })
      .eq("id", id);
    if (!err) await refresh();
    return err;
  }

  async function deleteTransaction(id) {
    const { error: err } = await supabase.from("transactions").delete().eq("id", id);
    if (!err) await refresh();
    return err;
  }

  return { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, refresh };
}

