import React from 'react';
import styled from 'styled-components'
import {
  useWallet,
  WalletProvider,
  ConnectionProvider,
  WalletContextState,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { getPhantomWallet, Wallet, } from '@solana/wallet-adapter-wallets';
import Colors from '../styles/Colors';
import { useDropzone } from 'react-dropzone';
import solweave from '@solweave/sdk';
import { ConfirmOptions } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css');

const Container = styled.div``;

const Modal = styled.div`
  background-color: ${Colors.White};
  height: 400px;
  width: 400px;
  border-radius: 8px;
  padding: 16px;
`;

const Dropzone = styled.div`
  border: 1px solid black;
  height: 300px;
  width: 300px;
`;

const wallets: Wallet[] = [getPhantomWallet()];
const network = 'http://127.0.0.1:8899';
const txConfirmOptions: ConfirmOptions = {
  preflightCommitment: 'processed',
  commitment: 'processed',
};

type AppProps = {};

const App: React.FC<AppProps> = () => {
  /** State */
  const [arweaveFileId, setAreaveFileId] = React.useState<string | null>(null);

  /** Hooks */
  const walletContextState: WalletContextState = useWallet();

  const onDrop = async (acceptedFiles: File[]) => {
    const txId = await solweave.upload({
      files: acceptedFiles,
      network: network,
      txConfirmOptions: txConfirmOptions,
      walletContextState: walletContextState,
    });

    console.log(txId);

    setAreaveFileId(txId);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  /** Render */


  if (!walletContextState.connected) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '100px',
        }}
      >
        <WalletMultiButton />
      </div>
    );
  }
  return (
    <Container>
      <Modal>
      <Dropzone
        {...getRootProps()}
      >
        <input {...getInputProps()} />
      </Dropzone>
      </Modal>
      File ID: {arweaveFileId}
    </Container>
  );
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);

export default AppWithProvider;
