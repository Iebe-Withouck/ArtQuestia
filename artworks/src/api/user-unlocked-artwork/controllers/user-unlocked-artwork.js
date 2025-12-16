'use strict';

/**
 * user-unlocked-artwork controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-unlocked-artwork.user-unlocked-artwork', ({ strapi }) => ({
  async create(ctx) {
    // Get the authenticated user
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be authenticated to unlock artworks');
    }

    // Get artwork ID from request body
    const { artwork, unlockedAt } = ctx.request.body.data;

    strapi.log.info('Creating unlock entry:', { userId: user.id, artworkId: artwork, body: ctx.request.body });

    if (!artwork) {
      return ctx.badRequest('Artwork ID is required');
    }

    // Check if already unlocked
    const existing = await strapi.entityService.findMany('api::user-unlocked-artwork.user-unlocked-artwork', {
      filters: {
        users_permissions_user: user.id,
        artwork: artwork,
      },
      populate: ['artwork', 'users_permissions_user'],
    });

    if (existing && existing.length > 0) {
      strapi.log.info('Artwork already unlocked:', { userId: user.id, artworkId: artwork });
      return ctx.send({ data: existing[0] });
    }

    // Create the unlocked artwork entry with the authenticated user
    try {
      // Use entityService with proper relation format
      const entry = await strapi.entityService.create('api::user-unlocked-artwork.user-unlocked-artwork', {
        data: {
          users_permissions_user: {
            id: user.id
          },
          artwork: {
            id: artwork
          },
          unlockedAt: unlockedAt || new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
      });

      strapi.log.info('Artwork unlocked successfully:', { 
        userId: user.id, 
        artworkId: artwork, 
        entryId: entry.id,
        entryData: entry 
      });
      
      // Fetch the created entry with populated relations to return
      const populatedEntry = await strapi.entityService.findOne(
        'api::user-unlocked-artwork.user-unlocked-artwork',
        entry.id,
        {
          populate: ['artwork', 'users_permissions_user'],
        }
      );
      
      return ctx.send({ data: populatedEntry });
    } catch (error) {
      strapi.log.error('Error creating unlock entry:', error);
      return ctx.badRequest('Failed to unlock artwork: ' + error.message);
    }

  },
}));
