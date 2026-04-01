import { useState, useCallback, useEffect } from "react";
import { PLANS } from "../constants/plans";
import { supabase } from "../services/supabase";

export default function usePlan(userId) {
  const [planId, setPlanId] = useState("starter");

  const plan = PLANS[planId];
  const isPro = planId === "pro";

  // Load plan from Supabase profile
  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", userId)
        .single();

      if (data?.plan && PLANS[data.plan]) {
        setPlanId(data.plan);
      }
    }

    load();
  }, [userId]);

  const switchPlan = useCallback(async (id) => {
    if (!PLANS[id] || !userId) return;

    setPlanId(id);

    const { error } = await supabase
      .from("profiles")
      .update({ plan: id })
      .eq("id", userId);

    if (error) {
      console.error("Erreur changement de plan:", error.message);
    }
  }, [userId]);

  const canAddOrder = useCallback(
    (currentCount) => isPro || currentCount < plan.limits.maxOrders,
    [isPro, plan]
  );

  const canAddItem = useCallback(
    (currentItemCount) => isPro || currentItemCount < plan.limits.maxItemsPerOrder,
    [isPro, plan]
  );

  return {
    planId,
    plan,
    isPro,
    switchPlan,
    canAddOrder,
    canAddItem,
    limits: plan.limits,
  };
}
