import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getContractAddress } from '../src/config';

describe('Contract configuration', () => {
  it('trims an explicitly configured contract address', () => {
    const previous = process.env.CONTRACT_ADDRESS;
    process.env.CONTRACT_ADDRESS = '  0xconfigured  ';

    try {
      assert.equal(getContractAddress(), '0xconfigured');
    } finally {
      if (previous === undefined) delete process.env.CONTRACT_ADDRESS;
      else process.env.CONTRACT_ADDRESS = previous;
    }
  });

  it('ignores an empty contract address override', () => {
    const previous = process.env.CONTRACT_ADDRESS;
    process.env.CONTRACT_ADDRESS = '   ';

    try {
      assert.notEqual(getContractAddress(), '');
    } finally {
      if (previous === undefined) delete process.env.CONTRACT_ADDRESS;
      else process.env.CONTRACT_ADDRESS = previous;
    }
  });
});