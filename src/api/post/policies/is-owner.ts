export default async (policyContext: any, config: any, { strapi }: any) => {
  const docs = strapi.documents("api::post.post")
  const user = policyContext.state.user;

  if (!user) return false;

  const { documentId } = policyContext.params;

  const post = await docs.findOne({
    documentId,
    populate: { author: { populate: { user: { fields: ['id'] } } } },
  });

  if (!post) return false;

  if(post.author?.user?.id !== user.id) return false;

  return true;
}