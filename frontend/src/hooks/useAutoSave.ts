import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutoSaveOptions {
  data: any;
  enabled: boolean;
  storageKey: string;
  saveInterval?: number; // milliseconds
  onSave?: () => void;
}

export const useAutoSave = ({
  data,
  enabled,
  storageKey,
  saveInterval = 30000, // 30 seconds
  onSave,
}: UseAutoSaveOptions) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Save to localStorage
  const saveDraft = useCallback(() => {
    if (!enabled || !data) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      }));
      setLastSaved(new Date());
      setIsDraft(true);
      onSave?.();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [enabled, data, storageKey, onSave]);

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsDraft(true);
        return parsed.data;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setIsDraft(false);
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // Always call the latest saveDraft without re-running effects when `data`
  // changes (callers typically pass a new object every render, e.g. RHF watch()).
  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    timerRef.current = setInterval(() => {
      saveDraftRef.current();
    }, saveInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [enabled, saveInterval]);

  // Save on unmount (saveDraft itself checks `enabled` and `data`)
  useEffect(() => {
    return () => {
      saveDraftRef.current();
    };
  }, []);

  return {
    isDraft,
    lastSaved,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};
