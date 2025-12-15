'use strict';

const admin = require('firebase-admin');

/**
 * Firebase authentication controller
 */

module.exports = {
  async authenticate(ctx) {
    const { idToken } = ctx.request.body;

    if (!idToken) {
      return ctx.badRequest('Firebase ID token is required');
    }

    // Check if Firebase is initialized (should be done at bootstrap)
    if (!admin.apps.length) {
      strapi.log.error('Firebase is not initialized. Check bootstrap logs.');
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
        // Get the default authenticated role
        const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });

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
            role: authenticatedRole.id,
          },
        });
        strapi.log.info('Created new user:', email, 'with Firebase UID:', uid, 'and role:', authenticatedRole.id);
      } else {
        // Update existing user with Firebase UID if not set
        if (!user.firebaseUID || !user.role) {
          const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
            where: { type: 'authenticated' },
          });

          const updateData = {
            firebaseUID: uid,
            name: userName || user.name || name || email.split('@')[0],
            age: age || user.age || null,
          };

          // Add role if missing
          if (!user.role) {
            updateData.role = authenticatedRole.id;
          }

          user = await strapi.query('plugin::users-permissions.user').update({
            where: { id: user.id },
            data: updateData,
          });
          strapi.log.info('Updated user with Firebase UID:', uid, 'role:', user.role);
        }
      }

      // Generate Strapi JWT token
      const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
      });

      strapi.log.info('Generated JWT for user:', user.id, 'email:', user.email, 'role:', user.role);

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
