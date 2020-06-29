import { User, IUser } from "../models/User.ts";
import { createToken, fetchUserByToken, JwtConfig } from "../util/token.ts";

const userModel = new User();

// @desc Register User
// @ route POST /api/v1/auth/register

const register = async ({
  request,
  response,
}: {
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
    const { email } = body.value;

    const userExists = await userModel.getUserByValue("email", email);

    if (!userExists) {
      let result = await userModel.addUser(body.value);
      const newUser: IUser = result;
      const jsonToken = await createToken(newUser);
      
      let userToSend = {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        jsonToken,
      };

      response.status = result.status;
      response.body = { success: true, data: userToSend };
    } else {
      response.status = 409;
      response.body = {
        success: false,
        msg: `User with Email:${email} already exists please try again`,
      };
    }
  }
};
// @desc Login User
// @ route POST /api/v1/auth/login

const login = async ({
  request,
  response,
}: {
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
    const { email, password } = body.value;
    
    console.log(email)

    let user = await userModel.getUserByValue("email", email);
    // console.log(user)d
    if (user) {
      // user = user.body.data;

      let isMatch = await userModel.passwordMatch(password, user.password);

      if (isMatch) {
        const jsonToken = await createToken(user);

        let userToSend = {
          name: user.name,
          email: user.email,
          role: user.role,
          jsonToken,
        };


        response.status = 200;
        response.body = {
          success: true,
          data: userToSend,
        };
      } else {
        response.status = 409;
        response.body = {
          success: false,
          msg: `Login credintials are incorrect`,
        };
      }
    } else {
      response.status = 409;
      response.body = {
        success: false,
        msg: `Login credintials are incorrect`,
      };
    }
  }
};

const me = async ({ request, response }: { request: any; response: any }) => {
  const token = request.headers
    .get(JwtConfig.header)
    ?.replace(`${JwtConfig.schema} `, "");

  const tokenUser = await fetchUserByToken(token);

  if (tokenUser) {
    const res = await userModel.getUser(tokenUser.id);

    response.status = res.status;
    response.body = res.body;
  } else {
    response.status = 409;
    response.body = {
      success: false,
      msg: `No User found`,
    };
  }
};

export { register, login, me };
