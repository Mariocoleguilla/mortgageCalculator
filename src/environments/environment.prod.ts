// The Firebase config is generated at build time from environment variables
// (GitHub Actions secrets in production). See scripts/generate-firebase-config.mjs.
import { firebaseConfig } from './firebase.config';

export const environment = {
  production: true,
  firebase: firebaseConfig,
};
