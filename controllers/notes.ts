import { INote, Note } from "../models/Note.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { makeResponse } from "../util/response.ts";
import { getUserByContext } from "../util/token.ts";

const noteModel = new Note();

export class NoteController {
  // @desc Get All Notes
  // @ route GET /api/v1/notes
  getNotes = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);

    let results = await noteModel.getNotes(ctx);
    ctx.response = makeResponse(ctx, 200, true, results);
  };

  getNote = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await noteModel.getNote(params.id);
    response = makeResponse(response, 200, true, results);
  };
  // @desc Get Single Notes
  // @ route GET /api/v1/notes/:id

  getNot = async (ctx: any) => {
    let results = await noteModel.getNote(ctx.params.id);

    ctx.response = makeResponse(ctx, 200, true, results);
  };

  // @desc Add Notes
  // @ route POST /api/v1/notes
  addNote = async (ctx: any) => {
    const body = await ctx.request.body();
    // console.log(body.value);
    if (!ctx.request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {
      const user: any = await getUserByContext(ctx);
      if (user) {
        body.value.user_id = +user.id;
        body.value.username = user.name;

        if (await noteModel.validate(body.value)) {
          const { text, model, model_id, user_id, username } = body.value;
          let note: INote = {
            text,
            user_id,
            model,
            model_id,
            username,
          };

          let result = await noteModel.addNote(note);

          ctx.response = makeResponse(ctx, 201, true, result);
        } else {
          throw new ErrorResponse("Please enter all required values", 404);
        }
      }
    }
  };

  // @desc update Notes
  // @ route PUT /api/v1/notes/:id

  updateNote = async ({
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
      let result = await noteModel.updateNote(body.value, params.id);
      // await auditLog("Note", result.id, "Updated", result.user_id)
      response = makeResponse(response, 201, true, result);
    }
  };

  // @desc Delete Note
  // @ route DELETE  /api/v1/notes/:id

  deleteNote = async (ctx: any) => {
    let results = await noteModel.deleteNote(ctx.params.id);
    ctx.response = makeResponse(ctx, 201, true, results);
  };


}
