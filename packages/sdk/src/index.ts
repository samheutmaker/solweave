import UploadCostCalculator from '@solweave/cost-calculator';
import { Provider } from '@project-serum/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  Connection,
  Transaction,
  SystemProgram,
  ConfirmOptions,
  PublicKey,
} from '@solana/web3.js';

interface SolweaveUploadParams {
  files: File[];
  network: string;
  txConfirmOptions: ConfirmOptions;
  walletContextState: WalletContextState;
}

const toPublicKey = new PublicKey('5aJP21X4exwSNvnQHgVp4RG6Fqw6bhAdpkFycbjahGFh');

async function upload(params: SolweaveUploadParams): Promise<string> {
  try {
    const uploadCost = await UploadCostCalculator.calculate(params.files.map((file) => file.size));

    console.log(uploadCost);

    const connection = new Connection(
      params.network,
      params.txConfirmOptions.preflightCommitment,
    );

    const provider = new Provider(
      connection,
        params.walletContextState as any,
        params.txConfirmOptions,
    );

    const transferTx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: toPublicKey,
      lamports: uploadCost.lamports,
    });

    const transaction = new Transaction().add(transferTx);

    const signature = await provider.send(transaction);
    console.log(signature);

    await provider.connection.confirmTransaction(signature, 'processed');
    return signature;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const SolweaveSdk = {
  upload,
};

export default SolweaveSdk;
