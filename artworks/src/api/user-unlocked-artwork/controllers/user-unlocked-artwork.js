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
      // First verify the artwork exists
      const artworkExists = await strapi.db.query('api::artwork.artwork').findOne({
        where: { id: artwork }
      });
      
      if (!artworkExists) {
        strapi.log.error('Artwork not found:', artwork);
        return ctx.badRequest('Artwork not found');
      }

      strapi.log.info('Creating entry with:', { userId: user.id, artworkId: artwork, artworkExists: !!artworkExists });

      // Use entityService.create which properly handles draft/publish
      // For Strapi v5, use connect for relations
      const entry = await strapi.entityService.create('api::user-unlocked-artwork.user-unlocked-artwork', {
        data: {
          users_permissions_user: { connect: [user.id] },
          artwork: { connect: [artwork] },
          unlockedAt: unlockedAt || new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        },
        populate: ['artwork', 'users_permissions_user'],
      });

      strapi.log.info('Entry created successfully:', { 
        documentId: entry.documentId,
        id: entry.id,
        userId: entry.users_permissions_user?.id,
        artworkId: entry.artwork?.id,
        publishedAt: entry.publishedAt,
        fullEntry: JSON.stringify(entry)
      });
      
      return ctx.send({ data: entry });
    } catch (error) {
      strapi.log.error('Error creating unlock entry:', error);
      return ctx.badRequest('Failed to unlock artwork: ' + error.message);
    }

  },
}));
