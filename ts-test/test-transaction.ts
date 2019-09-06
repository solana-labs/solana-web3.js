import {Account, Connection, Transaction, SystemProgram} from '..';

//
// run as: yarn run ts-test/test-transaction.ts
// [from this directory's parent, where package.json is]
//

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doTransfer() {
  const account1 = new Account();
  const account2 = new Account();

  const connection = new Connection('http://beta.testnet.solana.com:8899');
  const recentBlockhash = (await connection.getRecentBlockhash())[0];

  console.log(`TRANSFERRING from ${account1.publicKey.toString()} to ${account2.publicKey.toString()}`);

  console.log(`RECENT BLOCKHASH: ${recentBlockhash}`);

  const airdrop1 = await connection.requestAirdrop(account1.publicKey, 100000);
  console.log(`GOT AIRDROP1 CONFIRMATION: ${airdrop1}`);

  const airdrop2 = await connection.requestAirdrop(account2.publicKey, 100000);
  console.log(`GOT AIRDROP2 CONFIRMATION: ${airdrop2}`);

  const balance1a = await connection.getBalance(account1.publicKey);
  const balance2a = await connection.getBalance(account2.publicKey);

  console.log(`BEFORE> acct 1: ${balance1a}, acct 2: ${balance2a}`);

  const transfer = SystemProgram.transfer(
    account1.publicKey,
    account2.publicKey,
    123,
  );

  const transaction = new Transaction({recentBlockhash}).add(transfer);
  transaction.sign(account1, account2);

  const result = await connection.sendTransaction(transaction, account1, account2);
  console.log(`GOT TRANSFER RESULT: ${result}`);

  console.log(`SLEEPING 3s...`);
  await sleep(3000);

  const balance1b = await connection.getBalance(account1.publicKey);
  const balance2b = await connection.getBalance(account2.publicKey);

  console.log(`AFTER> acct 1: ${balance1b}, acct 2: ${balance2b}`);
}

doTransfer();
