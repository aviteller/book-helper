import { IUser, User } from "../models/User.ts";
import { helpers } from "https://deno.land/x/oak/mod.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
import { makeResponse } from "../util/response.ts";
const userModel = new User();

export class UserController {
  // @desc Get All Users
  // @ route GET /api/v1/users
  getUsers = async (ctx: any) => {
    
    let results = await userModel.getUsers(ctx);
    ctx.response = makeResponse(ctx, 200, true, results);
  };

  // @desc Get Single Users
  // @ route GET /api/v1/users/:id

  getUser = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await userModel.getUser(params.id);
    response = makeResponse(response, 200, true, results);
  };

  // @desc Add Users
  // @ route POST /api/v1/users
  addUser = async ({ request, response }: { request: any; response: any }) => {
    // console.log(body.value);
    const body = await request.body();
    if (!request.hasBody) {
      throw new ErrorResponse("No data found", 400);
    } else {
      if (await userModel.validate(body.value)) {
        const { name, email, password, role } = body.value;

        const user: IUser = {
          name,
          email,
          password,
          role,
        };

        const userExists = await userModel.getUserByValue("email", email);

        if (userExists.body.success === true) {
          throw new ErrorResponse(`User with email: ${email} already exists`, 404)
       
        } else {
          let result = await userModel.addUser(user);
          response = makeResponse(response, 201, true, result);
        }
      } else {
        throw new ErrorResponse("Please enter all required values", 404);
      }
    }
  };

  // @desc update Users
  // @ route PUT /api/v1/users/:id

  updateUser = async ({
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
      let result = await userModel.updateUser(body.value, params.id);
      response = makeResponse(response, 201, true, result);
    }
  };

  // @desc Delete User
  // @ route DELETE  /api/v1/users/:id

  deleteUser = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await userModel.deleteUser(params.id);
    response = makeResponse(response, 201, true, results);
  };
}
