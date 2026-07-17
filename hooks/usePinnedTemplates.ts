import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  isTemplatePinned,
  loadPinnedTemplateRefs,
  pinTemplate,
  PinnedTemplateRef,
  resolvePinnedTemplates,
  PinnedTemplateDisplay,
  unpinTemplate,
} from '@/services/pinnedTemplates';

export function usePinnedTemplates(sessionPassword?: string | null) {
  const [refs, setRefs] = useState<PinnedTemplateRef[]>([]);
  const [displays, setDisplays] = useState<PinnedTemplateDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextRefs = await loadPinnedTemplateRefs();
      const nextDisplays = await resolvePinnedTemplates(nextRefs, sessionPassword);
      setRefs(nextRefs);
      setDisplays(nextDisplays);
    } finally {
      setLoading(false);
    }
  }, [sessionPassword]);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh]),
  );

  const pin = useCallback(
    async (ref: PinnedTemplateRef) => {
      const next = await pinTemplate(ref);
      setRefs(next);
      setDisplays(await resolvePinnedTemplates(next, sessionPassword));
    },
    [sessionPassword],
  );

  const unpin = useCallback(
    async (ref: PinnedTemplateRef) => {
      const next = await unpinTemplate(ref);
      setRefs(next);
      setDisplays(await resolvePinnedTemplates(next, sessionPassword));
    },
    [sessionPassword],
  );

  const checkPinned = useCallback(async (ref: PinnedTemplateRef) => {
    return isTemplatePinned(ref);
  }, []);

  return { refs, displays, loading, refresh, pin, unpin, checkPinned };
}
