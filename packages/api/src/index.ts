import { Commitment } from '@solana/web3.js';
import loadEnvironment from './utils/loadEnvironment';

loadEnvironment();

import App from './app';
import {
  HTTP_PORT,
  SOLANA_NETWORK,
  SOLANA_PREFLIGHT_COMMITMENT,
  SOLANA_COMMITMENT,
  ARWEAVE_HOST,
  ARWEAVE_PORT,
  ARWEAVE_PROTOCOL,
  ARWEAVE_JWK_FILEPATH,
} from './env';

new App({
  port: HTTP_PORT,
  solanaConfig: {
    network: SOLANA_NETWORK,
    preflightCommitment: SOLANA_PREFLIGHT_COMMITMENT as Commitment,
    commitment: SOLANA_COMMITMENT as Commitment,
  },
  arweaveConfig: {
    host: ARWEAVE_HOST,
    port: ARWEAVE_PORT,
    protocol: ARWEAVE_PROTOCOL,
    jwkFilePath: ARWEAVE_JWK_FILEPATH,
  },
}).listen();
