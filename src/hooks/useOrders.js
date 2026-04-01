import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabase";

/**
 * Central hook for all order-related state and actions.
 * Connected to Supabase — orders + order_items tables.
 */
export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Fetch orders + their items from Supabase ──
  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Erreur chargement commandes:", error.message);
      } else {
        const mapped = (data || []).map((o) => ({
          ...o,
          items: (o.order_items || [])
            .sort((a, b) => a.position - b.position)
            .map((i) => ({ name: i.name, qty: i.qty, price: Number(i.price) })),
        }));
        setOrders(mapped);
      }
      setLoading(false);
    }

    fetchOrders();

    // Re-fetch when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchOrders();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ── Actions ──
  async function addOrder(draft) {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return;

    // 1. Insert the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id: userId,
        client: draft.client,
        phone: draft.phone || "",
        email: draft.email || "",
        payment: draft.payment,
        notes: draft.notes || "",
        status: "pending",
        date: new Date().toISOString().split("T")[0],
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Erreur ajout commande:", orderError.message);
      return;
    }

    // 2. Insert order items
    const itemsToInsert = draft.items.map((item, idx) => ({
      order_id: orderData.id,
      name: item.name,
      qty: Number(item.qty),
      price: Number(item.price),
      position: idx,
    }));

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsToInsert)
      .select();

    if (itemsError) {
      console.error("Erreur ajout articles:", itemsError.message);
    }

    // 3. Update local state
    const newOrder = {
      ...orderData,
      items: (itemsData || itemsToInsert).map((i) => ({
        name: i.name,
        qty: i.qty,
        price: Number(i.price),
      })),
    };
    setOrders((prev) => [newOrder, ...prev]);
  }

  async function changeStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour statut:", error.message);
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }

  async function deleteOrder(id) {
    // order_items are deleted automatically via ON DELETE CASCADE
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression commande:", error.message);
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  // ── Derived data ──
  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const matchSearch =
          o.client.toLowerCase().includes(search.toLowerCase()) ||
          (o.phone || "").toLowerCase().includes(search.toLowerCase()) ||
          (o.email || "").toLowerCase().includes(search.toLowerCase());
        const matchStatus =
          filterStatus === "all" || o.status === filterStatus;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [orders, search, filterStatus]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [orders]
  );

  return {
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
  };
}
