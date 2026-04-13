import { useState, useCallback, useEffect, useRef } from "react";
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
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Track whether a row exists in user_settings for this user
  const rowExistsRef = useRef(false);

  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { data, error } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", userId)
        .maybeSingle();

      if (data?.settings) {
        rowExistsRef.current = true;
        const merged = mergeSettings(data.settings);
        setSaved(merged);
        setDraft(merged);
      } else {
        rowExistsRef.current = false;
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
    if (!userId) return false;

    const currentDraft = draftRef.current;
    setSaving(true);
    setErrorMsg("");

    let error;

    if (rowExistsRef.current) {
      // Row exists — UPDATE
      ({ error } = await supabase
        .from("user_settings")
        .update({ settings: currentDraft })
        .eq("user_id", userId));
    } else {
      // No row yet — INSERT
      ({ error } = await supabase
        .from("user_settings")
        .insert({ user_id: userId, settings: currentDraft }));
    }

    setSaving(false);

    if (!error) {
      rowExistsRef.current = true;
      setSaved(currentDraft);
      return true;
    } else {
      console.error("Erreur sauvegarde paramètres:", error.message, error);
      setErrorMsg(error.message);
      return false;
    }
  }, [userId]);

  const discardChanges = useCallback(() => {
    setDraft(saved);
    setErrorMsg("");
  }, [saved]);

  const resetSettings = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from("user_settings")
      .delete()
      .eq("user_id", userId);

    rowExistsRef.current = false;
    setSaved(DEFAULT_SETTINGS);
    setDraft(DEFAULT_SETTINGS);
  }, [userId]);

  return {
    settings: saved,
    draft,
    hasChanges,
    saving,
    errorMsg,
    updateDraft,
    saveSettings,
    discardChanges,
    resetSettings,
  };
}
