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

  getChapter = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await chapterModel.getChapter(params.id);
    response = makeResponse(response, 200, true, results);
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

          if (isAllowed === "editable" || isAllowed === "owner") {
            let chapter: IChapter = {
              title,
              book_id,
              user_id: +user.id,
            };

            chapter.slug = await slugify(title);
            chapter = { ...chapter, ...values };

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

  updateChapter = async ({
    params,
    request,
    response,
  }: {
    params: { id: string };
    request: any;
    response: any;
  }) => {
    const body = await request.body();
    if (!request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {
      let result = await chapterModel.updateChapter(body.value, params.id);
      response = makeResponse(response, 201, true, result);
    }
  };

  // @desc Delete Chapter
  // @ route DELETE  /api/v1/chapters/:id

  deleteChapter = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await chapterModel.deleteChapter(params.id);
    response = makeResponse(response, 201, true, results);
  };
}
