import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { NETWORK_IDS, isNetworkId, parseNetworkFlag, resolveNetwork } from '../src/network';

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
});