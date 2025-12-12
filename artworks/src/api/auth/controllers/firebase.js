'use strict';

/**
 * Firebase authentication controller
 */

module.exports = {
  async authenticate(ctx) {
    const { idToken } = ctx.request.body;

    if (!idToken) {
      return ctx.badRequest('Firebase ID token is required');
    }

    try {
      // Log the received token
      strapi.log.info('Received Firebase ID token');
      
      // For now, just acknowledge receipt
      // You'll need to install firebase-admin to verify the token
      // For production, verify the token with Firebase Admin SDK
      
      return ctx.send({
        success: true,
        message: 'Firebase ID token received',
        token: idToken.substring(0, 20) + '...', // Log partial token for debugging
      });
    } catch (error) {
      strapi.log.error('Firebase authentication error:', error);
      return ctx.badRequest('Authentication failed');
    }
  },
};
