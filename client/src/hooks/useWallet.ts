import { useState, useCallback } from 'react';
import type { WalletDetails, WalletProvider, NetworkId } from '../types';

function getAvailableWalletProviders(): WalletProvider[] {
  const providers: WalletProvider[] = [];
  if (typeof window === 'undefined') return providers;

  const win = window as unknown as Record<string, unknown>;

  if (win['midnight'] && typeof win['midnight'] === 'object') {
    const midnight = win['midnight'] as Record<string, unknown>;
    for (const key of Object.keys(midnight)) {
      const candidate = midnight[key] as Record<string, unknown>;
      if (
        candidate &&
        (typeof candidate['connect'] === 'function' ||
          typeof candidate['enable'] === 'function')
      ) {
        providers.push({
          rdns: (candidate['rdns'] as string) || key,
          name: (candidate['name'] as string) || key,
          icon: (candidate['icon'] as string) || null,
          apiVersion: (candidate['apiVersion'] as string) || 'unknown',
          initialApi: candidate,
        });
      }
    }
  }

  if (
    providers.length === 0 &&
    win['lace'] &&
    typeof win['lace'] === 'object'
  ) {
    const lace = win['lace'] as Record<string, unknown>;
    if (
      typeof lace['connect'] === 'function' ||
      typeof lace['enable'] === 'function'
    ) {
      providers.push({
        rdns: 'mnLace',
        name: 'Lace Wallet',
        icon: null,
        apiVersion: '1.0.0',
        initialApi: lace,
      });
    }
  }

  return providers;
}

export function useWallet() {
  const [walletDetails, setWalletDetails] = useState<WalletDetails | null>(null);
  const [walletApi, setWalletApi] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const providers = getAvailableWalletProviders();
  const hasExtension = providers.length > 0;
  const primaryProvider = providers[0] ?? null;

  const connect = useCallback(async (network: NetworkId) => {
    const found = getAvailableWalletProviders();
    if (found.length === 0) {
      throw new Error(
        'No Midnight-compatible wallet extension detected. Please install Lace or Midnight Wallet.'
      );
    }
    const providerInfo = found[0];
    const initialApi = providerInfo.initialApi as Record<string, unknown>;

    setLoading(true);
    setError(null);

    try {
      let connectedApi: Record<string, unknown>;
      if (typeof initialApi['connect'] === 'function') {
        connectedApi = await (initialApi['connect'] as (n: string) => Promise<Record<string, unknown>>)(network);
      } else if (typeof initialApi['enable'] === 'function') {
        connectedApi = await (initialApi['enable'] as () => Promise<Record<string, unknown>>)();
      } else {
        throw new Error('Wallet provider does not implement connect() or enable().');
      }

      let shielded: unknown = null;
      let unshielded: unknown = null;

      if (typeof connectedApi['getShieldedAddresses'] === 'function') {
        try { shielded = await (connectedApi['getShieldedAddresses'] as () => Promise<unknown>)(); } catch { /* ignore */ }
      }
      if (typeof connectedApi['getUnshieldedAddress'] === 'function') {
        try { unshielded = await (connectedApi['getUnshieldedAddress'] as () => Promise<unknown>)(); } catch { /* ignore */ }
      }

      const shieldedAddress =
        (shielded as { shieldedAddress?: string })?.shieldedAddress ||
        (typeof shielded === 'string' ? shielded : null) || '';
      const unshieldedAddress =
        (unshielded as { unshieldedAddress?: string })?.unshieldedAddress ||
        (typeof unshielded === 'string' ? unshielded : null) || '';
      const primaryAddress = shieldedAddress || unshieldedAddress || 'connected';

      const details: WalletDetails = {
        rdns: providerInfo.rdns,
        name: providerInfo.name,
        network,
        address: primaryAddress,
        shieldedAddress,
        unshieldedAddress,
      };

      setWalletApi(connectedApi);
      setWalletDetails(details);

      try {
        await fetch('/api/wallet/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(details),
        });
      } catch { /* non-critical */ }

      return details;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const api = walletApi as Record<string, unknown> | null;
    if (api && typeof api['disconnect'] === 'function') {
      try { await (api['disconnect'] as () => Promise<void>)(); } catch { /* ignore */ }
    }
    setWalletApi(null);
    setWalletDetails(null);
    setError(null);
  }, [walletApi]);

  return {
    walletDetails,
    hasExtension,
    primaryProvider,
    loading,
    error,
    setError,
    connect,
    disconnect,
  };
}
