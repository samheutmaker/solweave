import path from 'path';
import process from 'process';
import { config } from 'dotenv';

function loadEnvironment() {
  const envVarFilePath = process.env.ENVIRONMENT_NAME ? `${process.cwd()}/ops/.env.${process.env.ENVIRONMENT_NAME}.local` : null;

  try {
    const result = config({
      path: path.resolve(envVarFilePath),
    });

    if (result && result.parsed) {
      Object.keys(result.parsed).forEach((key) => {
        process.env[key] = result.parsed[key];
      });
    }
  } catch (e) {
    console.info(`${process.env.ENV_PATH ?? '.env'} file not found, skipping..`);
  }
}

export default loadEnvironment;
