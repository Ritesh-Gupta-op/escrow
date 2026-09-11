import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  NETWORK_IDS,
  isNetworkId,
  getOrCreateSeed,
  parseNetworkFlag,
  recordDeployment,
  resolveNetwork,
  setActiveNetwork,
  loadState,
} from '../src/network';

describe('Network identifiers', () => {
  it('exposes every configured network as a valid identifier', () => {
    for (const network of NETWORK_IDS) {
      assert.equal(isNetworkId(network), true);
    }
  });

  it('rejects values that are not configured network identifiers', () => {
    assert.equal(isNetworkId('mainnet'), false);
    assert.equal(isNetworkId(''), false);
    assert.equal(isNetworkId(null), false);
    assert.equal(isNetworkId(42), false);
  });

  it('parses separated and equals-style network flags', () => {
    assert.equal(parseNetworkFlag(['node', 'script', '--network', 'preview']), 'preview');
    assert.equal(parseNetworkFlag(['node', 'script', '--network=preprod']), 'preprod');
    assert.equal(parseNetworkFlag(['node', 'script']), null);
  });

  it('rejects an unknown network flag', () => {
    assert.throws(
      () => parseNetworkFlag(['node', 'script', '--network', 'mainnet']),
      /Unknown network: mainnet/,
    );
  });

  it('defaults to the undeployed network without state or flags', () => {
    const result = resolveNetwork({
      argv: ['node', 'script'],
      env: {},
      cwd: 'C:\\path\\without\\state',
    });

    assert.equal(result.network, 'undeployed');
    assert.equal(result.source, 'default');
    assert.equal(result.config.node, 'ws://127.0.0.1:9944');
  });

  it('applies endpoint environment overrides to the selected network', () => {
    const result = resolveNetwork({
      argv: ['node', 'script', '--network=preview'],
      env: {
        MIDNIGHT_INDEXER_URL: 'https://example.test/graphql',
        MIDNIGHT_NODE_URL: 'https://example.test/rpc',
      },
      cwd: 'C:\\path\\without\\state',
    });

    assert.equal(result.network, 'preview');
    assert.equal(result.source, 'flag');
    assert.equal(result.config.indexer, 'https://example.test/graphql');
    assert.equal(result.config.node, 'https://example.test/rpc');
    assert.equal(result.config.indexerWS, 'wss://indexer.preview.midnight.network/api/v4/graphql/ws');
  });

  it('persists active network and deployment records together', () => {
    const cwd = mkdtempSync(join(tmpdir(), 'escrow-network-'));
    try {
      setActiveNetwork('preprod', { cwd });
      recordDeployment('preprod', '0xcontract', '0xdeployer', { cwd });

      const state = loadState({ cwd });
      assert.equal(state?.activeNetwork, 'preprod');
      assert.deepEqual(state?.deployments?.preprod, {
        address: '0xcontract',
        deployer: '0xdeployer',
        deployedAt: state?.deployments?.preprod?.deployedAt,
      });
      assert.match(state?.deployments?.preprod?.deployedAt ?? '', /^\d{4}-\d{2}-\d{2}T/);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('uses the genesis seed for local development', () => {
    const seed = getOrCreateSeed('undeployed', {
      env: {},
      cwd: 'C:\\path\\without\\state',
    });

    assert.equal(seed, '0000000000000000000000000000000000000000000000000000000000000001');
  });

  it('honors an explicitly supplied wallet seed', () => {
    const seed = getOrCreateSeed('preprod', {
      env: { MIDNIGHT_WALLET_SEED: 'test-seed' },
      cwd: 'C:\\path\\without\\state',
    });

    assert.equal(seed, 'test-seed');
  });
});