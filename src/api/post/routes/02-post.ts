/**
 * post router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::post.post', {
  config: {
    find: {
      middlewares: ['api::post.log-request']
    },
    update: {
      policies: ['api::post.is-owner'],
    },
    delete: {
      policies: ['api::post.is-owner'],
    },
  },
});
