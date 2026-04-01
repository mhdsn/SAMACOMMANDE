import { useState, useCallback, useEffect } from "react";
import { supabase } from "../services/supabase";

const DEFAULT_SETTINGS = {
  company: {
    name: "",
    address: "Dakar, Sénégal",
    ninea: "",
    phone: "",
    email: "",
  },
  invoice: {
    logo: "",
    accentColor: "#D4622B",
    footerText: "Merci pour votre confiance",
    paymentTerms: "",
  },
  theme: {
    accentColor: "",
  },
};

function mergeSettings(saved) {
  if (!saved) return DEFAULT_SETTINGS;
  return {
    company: { ...DEFAULT_SETTINGS.company, ...saved.company },
    invoice: { ...DEFAULT_SETTINGS.invoice, ...saved.invoice },
    theme: { ...DEFAULT_SETTINGS.theme, ...saved.theme },
  };
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export default function useSettings(userId) {
  const [saved, setSaved] = useState(DEFAULT_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_SETTINGS);

  // Load settings from Supabase when user changes
  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { data } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", userId)
        .single();

      if (data?.settings) {
        const merged = mergeSettings(data.settings);
        setSaved(merged);
        setDraft(merged);
      } else {
        setSaved(DEFAULT_SETTINGS);
        setDraft(DEFAULT_SETTINGS);
      }
    }

    load();
  }, [userId]);

  const hasChanges = !deepEqual(saved, draft);

  const updateDraft = useCallback((section, updates) => {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  const saveSettings = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        settings: draft,
      });

    if (!error) {
      setSaved(draft);
    } else {
      console.error("Erreur sauvegarde paramètres:", error.message);
    }
  }, [draft, userId]);

  const discardChanges = useCallback(() => {
    setDraft(saved);
  }, [saved]);

  const resetSettings = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    setSaved(DEFAULT_SETTINGS);
    setDraft(DEFAULT_SETTINGS);
  }, [userId]);

  return {
    settings: saved,
    draft,
    hasChanges,
    updateDraft,
    saveSettings,
    discardChanges,
    resetSettings,
  };
}
