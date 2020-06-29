import { IUser, User } from "../models/User.ts";
import { helpers } from "https://deno.land/x/oak/mod.ts";

const userModel = new User();

export class UserController {
  // @desc Get All Users
  // @ route GET /api/v1/users
  getUsers = async (ctx: any) => {
   

    let results = await userModel.getUsers(ctx);

    ctx.response.status = results.status;
    ctx.response.body = results.body;
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
    response.status = results.status;
    response.body = results.body;
  };

  // @desc Add Users
  // @ route POST /api/v1/users
  addUser = async ({ request, response }: { request: any; response: any }) => {
    // console.log(body.value);
    const body = await request.body();
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No data found",
      };
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
          response.status = 404;
          response.body = {
            success: false,
            msg: `User with email: ${email} already exists`,
          };
        } else {
          let result = await userModel.addUser(user);
          response.status = result.status;
          response.body = result.body;
        }
      } else {
        response.status = 404;
        response.body = {
          success: false,
          msg: "Please enter all required values",
        };
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
      response.status = 400;
      response.body = {
        success: false,
        msg: "No data found",
      };
    } else {
      let result = await userModel.updateUser(body.value, params.id);
      response.status = result.status;
      response.body = result.body;
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
    response.status = results.status;
    response.body = results.body;
  };
}
