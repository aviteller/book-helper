import { IBook, Book } from "../models/Book.ts";
import { Chapter } from "../models/Chapter.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { makeResponse } from "../util/response.ts";
import { getUserByContext } from "../util/token.ts";
import { slugify } from "../util/slugify.ts";
const bookModel = new Book();

export class BookController {
  // @desc Get All Books
  // @ route GET /api/v1/companies
  getBooks = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);

    let results = await bookModel.getBooks(ctx);
    ctx.response = makeResponse(ctx, 200, true, results);
  };
  // // @desc Get All Books
  // // @ route GET /api/v1/companies
  // getCompaniesWithJobs = async (ctx:any) => {
  //   // let queryParams = helpers.getQuery(ctx);

  //   let results = await bookModel.getCompaniesWithJobs(ctx);
  //   ctx.response = makeResponse(ctx, 200, true, results);
  // };

  // @desc Get Single Books
  // @ route GET /api/v1/companies/:id

  getBook = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await bookModel.getBook(params.id);
    response = makeResponse(response, 200, true, results);
  };
  // @desc Get Single Books
  // @ route GET /api/v1/companies/:id

  getBookWithDetails = async (ctx: any) => {
    let results = await bookModel.getBookWithDetails(ctx.params.id);
    
    ctx.response = makeResponse(ctx, 200, true, results);
  };

  // @desc Add Books
  // @ route POST /api/v1/companies
  addBook = async (ctx: any) => {
    const body = await ctx.request.body();
    // console.log(body.value);
    if (!ctx.request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {
      if (await bookModel.validate(body.value)) {
        const { name, ...values } = body.value;
        const user: any = await getUserByContext(ctx);
        if (user) {
          let book: IBook = {
            name,
            user_id: +user.id,
          };
          book.slug = await slugify(name);
          book = { ...book, ...values };
          let result = await bookModel.addBook(book);

          ctx.response = makeResponse(ctx, 201, true, result);
        }
      } else {
        throw new ErrorResponse("Please enter all required values", 404);
      }
    }
  };

  // @desc update Books
  // @ route PUT /api/v1/companies/:id

  updateBook = async ({
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
      let result = await bookModel.updateBook(body.value, params.id);
      // await auditLog("Book", result.id, "Updated", result.user_id)
      response = makeResponse(response, 201, true, result);
    }
  };

  // @desc Delete Book
  // @ route DELETE  /api/v1/companies/:id

  deleteBook = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await bookModel.deleteBook(params.id);
    response = makeResponse(response, 201, true, results);
  };
}
