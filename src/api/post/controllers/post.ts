/**
 * post controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::post.post', ({ strapi }) => {
  const docs = strapi.documents('api::post.post')
  const service = strapi.service('api::post.post');

  return ({
    async find(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: ctx.query.populate || {
          author: { fields: ['name'] },
          category: { fields: ['name', 'slug'] },
          tags: { fields: ['name', 'slug'] },
        },
      };
      return await super.find(ctx);
    },
    async findOne(ctx) {
      ctx.query = {
        ...ctx.query,
        populate: {
          author: { fields: ['name'], populate: { avatar: true } },
          category: { fields: ['name', 'slug'] },
          tags: { fields: ['name', 'slug'] },
          seo: true,
        },
      };

      const response = await super.findOne(ctx);

      if (response.data) {
        const related = await service
          .findRelated(response.data.documentId);
        response.data.relatedPosts = related;
      }

      return response;
    },
    async findFeatured(ctx) {
      const posts = await docs.findMany({
        filters: { featured: true },
        status: 'published',
        populate: {
          author: { fields: ['name'] },
          category: { fields: ['name', 'slug'] },
        },
        sort: { publishedAt: 'desc' },
        limit: 5
      });

      const { sanitizeOutput, transformResponse } = this;

      if (!sanitizeOutput || !transformResponse) {
        return ctx.internalServerError('Controller helpers unavailable');
      }

      const sanitized = await sanitizeOutput(posts, ctx);

      return transformResponse(sanitized);
    },

    async findRelated(ctx) {
      const { documentId } = ctx.params;
      const posts = await service.findRelated(documentId)

      const { sanitizeOutput, transformResponse } = this;

      if (!sanitizeOutput || !transformResponse) {
        return ctx.internalServerError('Controller helpers unavailable');
      }

      const sanitized = await sanitizeOutput(posts, ctx);

      return transformResponse(sanitized);
    },

    async findBySlug(ctx) {
      const { slug } = ctx.params;

      try {
        const post = await docs.findFirst({
          filters: { slug },
          status: 'published',
          populate: {
            author: { fields: ['name'], populate: { avatar: true } },
            category: { fields: ['name', 'slug'] },
            tags: { fields: ['name', 'slug'] },
            seo: true,
          }
        })

        if(!post) {
          return ctx.notFound('Post not found');
        }

        const { sanitizeOutput, transformResponse } = this;

        if (!sanitizeOutput || !transformResponse) {
          return ctx.internalServerError('Controller helpers unavailable');
        }

        const sanitized = await sanitizeOutput(post, ctx);
        return transformResponse(sanitized);
      } catch(error) {
        strapi.log.error("Error fetching post by slug", error);
        return ctx.internalServerError('Error fetching post by slug');
      }
    }
  })
});
