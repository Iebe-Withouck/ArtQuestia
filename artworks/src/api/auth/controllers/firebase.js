'use strict';

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (do this once)
const initializeFirebase = () => {
  if (admin.apps.length) {
    return; // Already initialized
  }

  try {
    const firebaseConfig = strapi.config.get('firebase');
    
    if (!firebaseConfig || !firebaseConfig.projectId) {
      strapi.log.warn('Firebase config not found. Please add firebase-service-account.json or set environment variables.');
      return;
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: firebaseConfig.clientEmail,
        privateKey: firebaseConfig.privateKey,
      }),
    });
    
    strapi.log.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    strapi.log.error('Failed to initialize Firebase Admin SDK:', error.message);
  }
};

/**
 * Firebase authentication controller
 */

module.exports = {
  async authenticate(ctx) {
    const { idToken } = ctx.request.body;

    if (!idToken) {
      return ctx.badRequest('Firebase ID token is required');
    }

    // Initialize Firebase if not already done
    initializeFirebase();

    // Check if Firebase is initialized
    if (!admin.apps.length) {
      return ctx.badRequest('Firebase is not configured. Please contact the administrator.');
    }

    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      strapi.log.info('Firebase token verified for user:', email);

      // Find or create user in Strapi
      let user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (!user) {
        // Create new user
        user = await strapi.query('plugin::users-permissions.user').create({
          data: {
            username: email,
            email: email,
            provider: 'firebase',
            confirmed: true,
            blocked: false,
          },
        });
        strapi.log.info('Created new user:', email);
      }

      // Generate Strapi JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      strapi.log.error('Firebase authentication error:', error);
      return ctx.badRequest('Authentication failed: ' + error.message);
    }
  },
};
