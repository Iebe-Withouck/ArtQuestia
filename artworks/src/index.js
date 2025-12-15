'use strict';

const admin = require('firebase-admin');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Initialize Firebase Admin SDK at startup
    if (!admin.apps.length) {
      try {
        const firebaseConfig = strapi.config.get('firebase');
        
        strapi.log.info('Bootstrap: Attempting to initialize Firebase with config:', {
          hasProjectId: !!firebaseConfig?.projectId,
          hasClientEmail: !!firebaseConfig?.clientEmail,
          hasPrivateKey: !!firebaseConfig?.privateKey,
          projectId: firebaseConfig?.projectId,
          privateKeyLength: firebaseConfig?.privateKey?.length,
        });
        
        if (!firebaseConfig || !firebaseConfig.projectId) {
          strapi.log.error('Bootstrap: Firebase config not found or incomplete');
          return;
        }
        
        if (!firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
          strapi.log.error('Bootstrap: Firebase config incomplete - missing clientEmail or privateKey');
          return;
        }
        
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebaseConfig.projectId,
            clientEmail: firebaseConfig.clientEmail,
            privateKey: firebaseConfig.privateKey,
          }),
        });
        
        strapi.log.info('Bootstrap: Firebase Admin SDK initialized successfully');
      } catch (error) {
        strapi.log.error('Bootstrap: Failed to initialize Firebase Admin SDK:', error);
        strapi.log.error('Bootstrap: Error stack:', error.stack);
      }
    }
  },
};
