import { useState, useCallback, useEffect } from 'react';
import type { EscrowState } from '../types';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  const body = await res.json() as T & { error?: string };
  if (!res.ok) {
    throw new Error((body as { error?: string }).error || JSON.stringify(body));
  }
  return body;
}

const EMPTY_STATE: EscrowState = {
  contractAddress: null,
  status: null,
  statusName: null,
  agreementCommitment: null,
  buyerAuthority: null,
  sellerAuthority: null,
  network: null,
  message: null,
};

export function useEscrow() {
  const [escrowState, setEscrowState] = useState<EscrowState>(EMPTY_STATE);
  const [response, setResponse] = useState<string>('Loading contract state…');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setResponse('Refreshing contract state…');
    try {
      const payload = await fetchJson<EscrowState & { message?: string }>('/api/escrow');
      setEscrowState(payload);
      setResponse('Escrow status refreshed successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setEscrowState({
        ...EMPTY_STATE,
        message: 'Deploy contract and configure CONTRACT_ADDRESS.',
      });
      setResponse(message);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createEscrow = useCallback(async (data: {
    buyer: string;
    seller: string;
    amount: string;
    terms: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => {
    setLoading(true);
    setResponse('Creating escrow circuit transaction…');
    try {
      const result = await fetchJson('/api/escrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setResponse(JSON.stringify(result, null, 2));
      await refresh();
    } catch (err) {
      setResponse(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const releaseEscrow = useCallback(async (data: {
    seller: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => {
    setLoading(true);
    setResponse('Releasing escrow circuit transaction…');
    try {
      const result = await fetchJson('/api/escrows/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setResponse(JSON.stringify(result, null, 2));
      await refresh();
    } catch (err) {
      setResponse(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const refundEscrow = useCallback(async (data: {
    buyer: string;
    walletAddress: string;
    shieldedAddress: string;
    unshieldedAddress: string;
    rdns: string;
  }) => {
    setLoading(true);
    setResponse('Refunding escrow circuit transaction…');
    try {
      const result = await fetchJson('/api/escrows/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setResponse(JSON.stringify(result, null, 2));
      await refresh();
    } catch (err) {
      setResponse(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    escrowState,
    response,
    loading,
    setResponse,
    refresh,
    createEscrow,
    releaseEscrow,
    refundEscrow,
  };
}
