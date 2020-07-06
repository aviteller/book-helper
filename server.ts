import { Application, isHttpError, send } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import {logger} from './middleware/logger.ts';
import router from "./routes/routes.ts";
const port = Deno.env.get("PORT") || 5000;
const app = new Application();

app.use(async (ctx, next) => {
  try {
    // console.log(ctx.request.headers)
    await next();
  } catch (err) {
    console.log(err)
    if (isHttpError(err)) {
      switch (err.status) {
        case 404:
          ctx.response.status = 404;
          ctx.response.body = {
            success: false,
            msg: err.toString()
              ? `${err.toString()}`
              : "Resource could not be found",
          };
          break;

        default:
          ctx.response.status = err.status || 400;
          ctx.response.body = {
            success: false,
            msg: err.toString() || "Resource could not be processed",
          };
          break;
      }
    } else {
      ctx.response.status = err.status || 500;
      ctx.response.body = {
        success: false,
        msg: `${err.toString()}`,
      };
    }
  }
});

// // template rending
// app.use(async (ctx) => {
 
//     await send(ctx, ctx.request.url.pathname, {
//       root: `${Deno.cwd()}/client/public`,
//       index: "index.html",
//       extensions: ["html"],
//     });
 
// });
app.use(oakCors());
app.use(logger);
app.use(router.routes());
app.use(router.allowedMethods());

console.info(`Server running on port: ${port}`);

await app.listen({ port: +port });
