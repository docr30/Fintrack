import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: true });
    if (!error) setTransactions(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addTransaction(tx) {
    const { error } = await supabase.from("transactions").insert([{ ...tx, user_id: userId }]);
    if (!error) await refresh();
    return error;
  }

  async function deleteTransaction(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) await refresh();
    return error;
  }

  return { transactions, loading, addTransaction, deleteTransaction, refresh };
}
