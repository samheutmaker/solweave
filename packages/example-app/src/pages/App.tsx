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

const Dropzone = styled.div`
  border: 2px dashed ${Colors.Grey400};
  height: 300px;
  width: 400px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    cursor: pointer;
  }
`;

const Text = styled.div`
  font-size: 1rem;
  color: ${Colors.Black};
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
  const [arweaveFileUrls, setArweaveFileUrls] = React.useState<string[] | null>(null);

  /** Hooks */
  const walletContextState: WalletContextState = useWallet();

  const onDrop = async (acceptedFiles: File[]) => {
    const imageUrls: string[] = await solweave.upload({
      files: acceptedFiles,
      network: network,
      txConfirmOptions: txConfirmOptions,
      walletContextState: walletContextState,
    });

    setArweaveFileUrls(imageUrls);
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
      <Dropzone
        {...getRootProps()}
      >
        <Text>Click or drop files to upload</Text>
        <input {...getInputProps()} />
      </Dropzone>
      File URL: {arweaveFileUrls}
      {arweaveFileUrls?.length && (
        arweaveFileUrls.map((arweaveFileUrl: string) => <img src={arweaveFileUrl} alt="arweave file" />)
      )}
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
