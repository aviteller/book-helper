import { DB } from "../helpers/DB.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export class User extends DB {
  table = "users";
  
  //make function in higher class
  validate(values: any) {
    if (
      "name" in values &&
      "email" in values &&
      "password" in values &&
      "role" in values
    ) {
      return true;
    } else {
      return false;
    }
  }

  async getUser(id: any) {
    return await this.getOne(id);
  }

  async passwordMatch(enteredPassword: string, hashedPassword: string) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  async getUserByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getUsers(queryParams: any) {
    if (queryParams.select == undefined)
      queryParams.select = "id,name,email,role,created_at";

    return await this.getAll(queryParams);
  }

  async addUser(values: any) {
    let { password } = values;

    const hash = await bcrypt.hash(password);

    values.password = hash;

    return await this.addOne(values);
  }

  async updateUser(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteUser(id: any) {
    return await this.deleteOne(id);
  }
}
