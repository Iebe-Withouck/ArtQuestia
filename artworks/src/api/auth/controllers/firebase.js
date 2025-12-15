'use strict';

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (do this once)
const initializeFirebase = () => {
  if (admin.apps.length) {
    return; // Already initialized
  }

  try {
    const firebaseConfig = strapi.config.get('firebase');
    
    strapi.log.info('Attempting to initialize Firebase with config:', {
      hasProjectId: !!firebaseConfig?.projectId,
      hasClientEmail: !!firebaseConfig?.clientEmail,
      hasPrivateKey: !!firebaseConfig?.privateKey,
      projectId: firebaseConfig?.projectId,
    });
    
    if (!firebaseConfig || !firebaseConfig.projectId) {
      strapi.log.warn('Firebase config not found. Please add firebase-service-account.json or set environment variables.');
      return;
    }
    
    if (!firebaseConfig.clientEmail || !firebaseConfig.privateKey) {
      strapi.log.error('Firebase config incomplete - missing clientEmail or privateKey');
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
    strapi.log.error('Failed to initialize Firebase Admin SDK:', error);
    strapi.log.error('Error stack:', error.stack);
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

      // Get additional user data from request body
      const { name: userName, age } = ctx.request.body;

      // Find or create user in Strapi
      let user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { email },
      });

      if (!user) {
        // Create new user with Firebase UID
        user = await strapi.query('plugin::users-permissions.user').create({
          data: {
            username: email,
            email: email,
            provider: 'firebase',
            firebaseUID: uid,
            name: userName || name || email.split('@')[0],
            age: age || null,
            confirmed: true,
            blocked: false,
          },
        });
        strapi.log.info('Created new user:', email, 'with Firebase UID:', uid);
      } else {
        // Update existing user with Firebase UID if not set
        if (!user.firebaseUID) {
          user = await strapi.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: {
              firebaseUID: uid,
              name: userName || user.name || name || email.split('@')[0],
              age: age || user.age || null,
            },
          });
          strapi.log.info('Updated user with Firebase UID:', uid);
        }
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
          firebaseUID: user.firebaseUID,
          name: user.name,
          age: user.age,
        },
      });
    } catch (error) {
      strapi.log.error('Firebase authentication error:', error);
      return ctx.badRequest('Authentication failed: ' + error.message);
    }
  },
};
