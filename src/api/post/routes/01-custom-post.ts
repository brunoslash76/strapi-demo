export default {
  routes: [
    {
      method: 'GET',
      path: '/posts/featured',
      handler: 'api::post.post.findFeatured',
      config: {
        auth: false,
      }
    },
    {
      method: 'PUT',
      path: '/posts/:documentId',
      handler: 'api::post.post.update',
      config: {
        policies: [
          'api::post.is-owner',
          {
            name: 'global::rate-limit',
            config: {
              max: 10,
              windowMs: 60_000,
            }
          }
        ],
      }
    }
  ]
}