'use strict';

/**
 * user-unlocked-artwork controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-unlocked-artwork.user-unlocked-artwork', ({ strapi }) => ({
  async find(ctx) {
    // Get the authenticated user
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be authenticated to view unlocked artworks');
    }

    try {
      strapi.log.info('Fetching unlocked artworks for user:', user.id);

      // Use db query for more reliable filtering
      const entries = await strapi.db.query('api::user-unlocked-artwork.user-unlocked-artwork').findMany({
        where: {
          users_permissions_user: user.id,
          publishedAt: { $notNull: true },
        },
        populate: {
          artwork: {
            select: ['id'],
          },
        },
      });

      strapi.log.info('Found entries:', entries.length);

      // Transform to only return artwork IDs (simpler for frontend)
      const artworkIds = entries
        .filter(entry => entry.artwork && entry.artwork.id)
        .map(entry => entry.artwork.id);

      strapi.log.info('User', user.id, 'unlocked artworks:', artworkIds);

      return ctx.send({ data: artworkIds });
    } catch (error) {
      strapi.log.error('Error fetching unlocked artworks:', error);
      return ctx.badRequest('Failed to fetch unlocked artworks: ' + error.message);
    }
  },

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
      // For manyToOne relations, set as object with id property
      const entry = await strapi.entityService.create('api::user-unlocked-artwork.user-unlocked-artwork', {
        data: {
          users_permissions_user: { id: user.id },
          artwork: { id: artwork },
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
        users_permissions_user: entry.users_permissions_user,
        fullEntry: JSON.stringify(entry)
      });

      // Extra log: check if user relation is present
      if (!entry.users_permissions_user) {
        strapi.log.error('❌ users_permissions_user relation is missing in created entry!', { entry });
      } else {
        strapi.log.info('✅ users_permissions_user relation is present:', { user: entry.users_permissions_user });
      }

      return ctx.send({ data: entry });
    } catch (error) {
      strapi.log.error('Error creating unlock entry:', error);
      return ctx.badRequest('Failed to unlock artwork: ' + error.message);
    }

  },
}));
