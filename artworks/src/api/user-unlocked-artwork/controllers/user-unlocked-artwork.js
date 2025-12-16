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

    if (!artwork) {
      return ctx.badRequest('Artwork ID is required');
    }

    // Check if already unlocked
    const existing = await strapi.entityService.findMany('api::user-unlocked-artwork.user-unlocked-artwork', {
      filters: {
        users_permissions_user: user.id,
        artwork: artwork,
      },
    });

    if (existing && existing.length > 0) {
      strapi.log.info('Artwork already unlocked:', { userId: user.id, artworkId: artwork });
      return ctx.send({ data: existing[0] });
    }

    // Create the unlocked artwork entry with the authenticated user
    const entry = await strapi.entityService.create('api::user-unlocked-artwork.user-unlocked-artwork', {
      data: {
        users_permissions_user: user.id,
        artwork: artwork,
        unlockedAt: unlockedAt || new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
    });

    strapi.log.info('Artwork unlocked:', { userId: user.id, artworkId: artwork, entryId: entry.id });

    return ctx.send({ data: entry });
  },
}));
