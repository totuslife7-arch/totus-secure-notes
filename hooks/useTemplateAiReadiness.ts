import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  getTemplateAiReadiness,
  TemplateAiReadiness,
} from '@/services/templateAi/generateTemplateDraft';
import { getModelSizeOnDisk } from '@/services/templateAi/modelManager';

const DEFAULT_READINESS: TemplateAiReadiness = {
  entitled: false,
  supported: false,
  expoGo: false,
  modelReady: false,
  llamaAvailable: false,
  llamaError: null,
  canRun: false,
};

export function useTemplateAiReadiness() {
  const [readiness, setReadiness] = useState<TemplateAiReadiness>(DEFAULT_READINESS);
  const [modelBytes, setModelBytes] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [next, bytes] = await Promise.all([getTemplateAiReadiness(), getModelSizeOnDisk()]);
      setReadiness(next);
      setModelBytes(bytes);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh().catch(() => undefined);
    }, [refresh]),
  );

  return { readiness, modelBytes, loading, refresh };
}
