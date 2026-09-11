import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { NETWORK_IDS, isNetworkId } from '../src/network';

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
});