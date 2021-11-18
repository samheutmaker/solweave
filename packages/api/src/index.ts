import {
  Connection,
  Transaction,
  SystemProgram,

  ConfirmOptions,
  PublicKey,
  Keypair,
} from '@solana/web3.js';

const network = 'http://127.0.0.1:8899';

const txConfirmOptions: ConfirmOptions = {
  preflightCommitment: 'confirmed',
  commitment: 'confirmed',
};

async function main() {
  const connection = new Connection(
    network,
    txConfirmOptions.preflightCommitment,
  );

  const tx = await connection.getTransaction('4qLT98MrugRqybv25SpEm1SYWK6U4J1vwM4eqC3jDY6vHuxXKn5JTevgUd4TU4oczSQWipiuDBs99pJwe2AgosP6');

  console.log(JSON.stringify(tx, null, 2));
}

main();
