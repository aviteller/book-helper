

export const logger = async (ctx: any, next: () => Promise<void>) => {
  console.log(
    `${ctx.request.method} ${
      ctx.request.url
    } - Referer ${ctx.request.headers.get(
      "origin"
    )} at ${new Date().toISOString()}`
  );
  await next();
};
