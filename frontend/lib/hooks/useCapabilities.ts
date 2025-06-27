import { useState, useEffect, useCallback } from 'react';
import { getApiEndpoint } from '@/lib/api-url';

interface AIProvider {
  name: string;
  enabled: boolean;
  model_count: number;
}

interface AuthenticationStatus {
  enabled: boolean;
  provider: string;
}

interface PaymentStatus {
  enabled: boolean;
  providers: string[];
}

interface FeatureDetails {
  ai_providers: {
    enabled: boolean;
    available: string[];
    configured: AIProvider[];
  };
  authentication: AuthenticationStatus;
  payments: PaymentStatus;
  vector_search: {
    enabled: boolean;
    provider: string;
  };
}

interface CapabilitiesData {
  mode: string;
  is_demo: boolean;
  capabilities: {
    auth: string;
    database: string;
    openai?: string;
    anthropic?: string;
    deepseek?: string;
    gemini?: string;
    payments?: string;
    [key: string]: string | undefined;
  };
  features: FeatureDetails;
  tips?: string[];
  warnings?: string[];
}

interface UseCapabilitiesReturn {
  capabilities: CapabilitiesData | null;
  isLoading: boolean;
  isDemoMode: boolean;
  hasRealAuth: boolean;
  hasRealAI: boolean;
  mode: string;
  error: Error | null;
  isApiDown: boolean;
  refetch: () => void;
}

const DEFAULT_CAPABILITIES: CapabilitiesData = {
  mode: 'demo',
  is_demo: true,
  capabilities: {
    auth: 'demo',
    database: 'demo'
  },
  features: {
    ai_providers: {
      enabled: false,
      available: ['demo'],
      configured: []
    },
    authentication: {
      enabled: false,
      provider: 'demo'
    },
    payments: {
      enabled: false,
      providers: []
    },
    vector_search: {
      enabled: false,
      provider: 'demo'
    }
  },
  tips: [],
  warnings: []
};

export function useCapabilities(): UseCapabilitiesReturn {
  const [capabilities, setCapabilities] = useState<CapabilitiesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isApiDown, setIsApiDown] = useState(false);

  const fetchCapabilities = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsApiDown(false);

      const response = await fetch(getApiEndpoint('/api/system/capabilities'), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch capabilities: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCapabilities(data.data);
      } else {
        setCapabilities(DEFAULT_CAPABILITIES);
      }
    } catch (err) {
      console.error('Error fetching capabilities:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsApiDown(true);
      setCapabilities(DEFAULT_CAPABILITIES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCapabilities();
  }, [fetchCapabilities]);

  const isDemoMode = capabilities?.is_demo ?? true;
  const hasRealAuth = capabilities?.capabilities?.auth !== 'demo';
  const hasRealAI = capabilities?.features?.ai_providers?.available?.some(p => p !== 'demo') ?? false;
  const mode = capabilities?.mode ?? 'demo';

  return {
    capabilities,
    isLoading,
    isDemoMode,
    hasRealAuth,
    hasRealAI,
    mode,
    error,
    isApiDown,
    refetch: fetchCapabilities
  };
}