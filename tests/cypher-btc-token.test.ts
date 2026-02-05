import { describe, it, expect } from 'vitest';
import { Cl } from '@stacks/transactions';

const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

describe('cypher-btc-tokenv2', () => {
  it('should set the correct contract owner on deploy', () => {
    const ownerCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-contract-owner', [], deployer);
    expect(ownerCall.result).toBeOk(Cl.principal(deployer));
  });

  it('mint called by contract owner succeeds and updates balances and total supply', () => {
    const amount = 1000000; // 1 cBTC with 6 decimals
    const mintCall = simnet.callPublicFn('cypher-btc-tokenv2', 'mint', [Cl.uint(amount), Cl.principal(wallet1)], deployer);
    expect(mintCall.result).toBeOk(Cl.bool(true));

    // Check recipient balance
    const balanceCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-balance', [Cl.principal(wallet1)], wallet1);
    expect(balanceCall.result).toBeOk(Cl.uint(amount));

    // Check total supply
    const totalSupplyCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-total-supply', [], deployer);
    expect(totalSupplyCall.result).toBeOk(Cl.uint(amount));
  });

  it('mint called by non-owner fails', () => {
    const amount = 1000000;
    const mintCall = simnet.callPublicFn('cypher-btc-tokenv2', 'mint', [Cl.uint(amount), Cl.principal(wallet1)], wallet1);
    expect(mintCall.result).toBeErr(Cl.uint(2));
  });

  it('transfer succeeds when sender has sufficient balance', () => {
    const mintAmount = 2000000;
    const transferAmount = 1000000;

    // Mint to wallet1
    simnet.callPublicFn('cypher-btc-tokenv2', 'mint', [Cl.uint(mintAmount), Cl.principal(wallet1)], deployer);

    // Transfer from wallet1 to wallet2
    const transferCall = simnet.callPublicFn('cypher-btc-tokenv2', 'transfer', [Cl.uint(transferAmount), Cl.principal(wallet1), Cl.principal(wallet2)], wallet1);
    expect(transferCall.result).toBeOk(Cl.bool(true));

    // Check balances
    const balance1Call = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-balance', [Cl.principal(wallet1)], wallet1);
    expect(balance1Call.result).toBeOk(Cl.uint(mintAmount - transferAmount));

    const balance2Call = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-balance', [Cl.principal(wallet2)], wallet2);
    expect(balance2Call.result).toBeOk(Cl.uint(transferAmount));

    // Total supply unchanged
    const totalSupplyCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-total-supply', [], deployer);
    expect(totalSupplyCall.result).toBeOk(Cl.uint(mintAmount));
  });

  it('transfer fails when sender does not have sufficient balance', () => {
    const transferAmount = 1000000;
    const transferCall = simnet.callPublicFn('cypher-btc-tokenv2', 'transfer', [Cl.uint(transferAmount), Cl.principal(wallet1), Cl.principal(wallet2)], wallet1);
    expect(transferCall.result).toBeErr(Cl.uint(1)); // ft-transfer? error for insufficient balance
  });

  it('get-balance returns the latest state after operations', () => {
    // Mint and transfer as above, balances already checked
    // This is covered in the transfer test
  });

  it('get-total-supply returns the latest state after mint operations', () => {
    // Covered in mint test
  });

  it('get-name returns CypherBTC', () => {
    const nameCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-name', [], deployer);
    expect(nameCall.result).toBeOk(Cl.stringAscii('CypherBTC'));
  });

  it('get-symbol returns cBTC', () => {
    const symbolCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-symbol', [], deployer);
    expect(symbolCall.result).toBeOk(Cl.stringAscii('cBTC'));
  });

  it('get-decimals returns 6', () => {
    const decimalsCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-decimals', [], deployer);
    expect(decimalsCall.result).toBeOk(Cl.uint(6));
  });

  it('contract owner remains unchanged after minting operations', () => {
    // Mint some tokens first
    const amount = 500000;
    simnet.callPublicFn('cypher-btc-tokenv2', 'mint', [Cl.uint(amount), Cl.principal(wallet1)], deployer);

    // Verify owner is still the deployer
    const ownerCall = simnet.callReadOnlyFn('cypher-btc-tokenv2', 'get-contract-owner', [], deployer);
    expect(ownerCall.result).toBeOk(Cl.principal(deployer));
  });
});