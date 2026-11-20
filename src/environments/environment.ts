// `ng build` replaces this file with `environment.prod.ts` (see fileReplacements in angular.json).
//
// The Firebase config is NOT stored in the repository: firebase.config.ts is generated
// from environment variables by scripts/generate-firebase-config.mjs before start/build/test.
import { firebaseConfig } from './firebase.config';

export const environment = {
  production: false,
  firebase: firebaseConfig,
};
