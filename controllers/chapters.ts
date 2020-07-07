import { IChapter, Chapter, EChapterStatus } from "../models/Chapter.ts";
import { Book } from "../models/Book.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { makeResponse } from "../util/response.ts";
import { getUserByContext } from "../util/token.ts";
import { slugify } from "../util/slugify.ts";
const chapterModel = new Chapter();
const bookModel = new Book();

export class ChapterController {
  // @desc Get All Chapters
  // @ route GET /api/v1/chapters
  getChapters = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);
    let results = await chapterModel.getChapters(ctx);
    ctx.response = makeResponse(ctx, 200, true, results);
  };

  // @desc Get Single Chapters
  // @ route GET /api/v1/chapters/:id

  getChapter = async (ctx: any) => {
    let results = await chapterModel.getChapter(ctx.params.id);
    ctx.response = makeResponse(ctx, 200, true, results);
  };

  getChapterWithDetails = async (ctx: any) => {
    const user: any = await getUserByContext(ctx);
    let permisson = await chapterModel.permissons(ctx.params.id, user);
    if (permisson !== "no-access") {
      let results: any = await chapterModel.getChapterWithDetails(
        ctx.params.id,
      );
      results.permisson = permisson;
      ctx.response = makeResponse(ctx, 200, true, results);
    } else {
      ctx.response = makeResponse(
        ctx,
        200,
        true,
        { success: false, msg: "no-access" },
      );
    }
  };

  // @desc Add Chapters
  // @ route POST /api/v1/chapters
  addChapter = async (ctx: any) => {
    // console.log(body.value);
    const body = await ctx.request.body();
    if (!ctx.request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {
      if (await chapterModel.validate(body.value)) {
        const { title, book_id, ...values } = body.value;
        const user: any = await getUserByContext(ctx);
        /**
         * TODO: add function that checks if book by book_id check if user is
         * owner by user_id 
         * if user is not owner check if book is public if its public check 
         * if its public_read_only
         * 
         */

        if (user) {
          let isAllowed = await bookModel.permissons(book_id, user);

          if (
            isAllowed === "editable" || isAllowed === "owner" ||
            isAllowed === "admin"
          ) {
            let chapter: IChapter = {
              title,
              book_id,
              user_id: +user.id,
            };
            let position = await chapterModel.getPositionByBookID(book_id);
          
            position !== null ? position++ : 1
            
            chapter.slug = await slugify(title);
            chapter = { ...chapter, ...values, position };

            let result = await chapterModel.addChapter(chapter);
            ctx.response = makeResponse(ctx, 201, true, result);
          } else {
            throw new ErrorResponse("Permissons Denied", 404);
          }
        }
      } else {
        throw new ErrorResponse("Please enter all required values", 404);
      }
    }
  };

  // @desc update Chapters
  // @ route PUT /api/v1/chapters/:id

  updateChapter = async (ctx: any) => {
    const body = await ctx.request.body();
    if (!ctx.request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {

      if(body.value.text) body.value.word_count = await chapterModel.wordCount(body.value.text)

      let result = await chapterModel.updateChapter(body.value, ctx.params.id);
      ctx.response = makeResponse(ctx, 201, true, result);
    }
  };

  // @desc Delete Chapter
  // @ route DELETE  /api/v1/chapters/:id

  deleteChapter = async (ctx: any) => {
    let results = await chapterModel.deleteChapter(ctx.params.id);
    ctx.response = makeResponse(ctx, 201, true, results);
  };
  // @desc Delete Chapter
  // @ route DELETE  /api/v1/chapters/:id

  swapPosition = async (ctx: any) => {
    let results = await chapterModel.swapPosition(ctx.params.first_id, ctx.params.second_id);
    ctx.response = makeResponse(ctx, 201, true, results);
  };
}
