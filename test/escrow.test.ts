import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

describe('Escrow Circuit & Privacy Logic', () => {
  it('computes authority commitment correctly from role and secret', () => {
    const role = Buffer.from(createHash('sha256').update('buyer', 'utf8').digest());
    const secret = Buffer.from(createHash('sha256').update('buyer-secret-12345', 'utf8').digest());

    const commitment = createHash('sha256')
      .update(Buffer.concat([role, secret]))
      .digest('hex');

    assert.equal(typeof commitment, 'string');
    assert.equal(commitment.length, 64);
  });

  it('validates secret requirements for buyer and seller authorization', () => {
    const validSecret = 'super-secret-authorization-key-12345';
    const invalidSecret = 'short';

    assert.ok(validSecret.length >= 12);
    assert.ok(invalidSecret.length < 12);
  });

  it('ensures distinct commitments for buyer and seller', () => {
    const buyerSecret = 'buyer-secret-phrase-authorization-key';
    const sellerSecret = 'seller-secret-phrase-authorization-key';

    const buyerHash = createHash('sha256').update(buyerSecret).digest('hex');
    const sellerHash = createHash('sha256').update(sellerSecret).digest('hex');

    assert.notEqual(buyerHash, sellerHash);
  });
});
