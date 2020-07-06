import { DB } from "../helpers/DB.ts";

export interface INote {
  id?: string;
  user_id: number;
  model: string;
  model_id: number;
  text: string;
}

export class Note extends DB {
  table = "notes";

  //make function in higher class
  validate(values: any) {
    if (
      "user_id" in values &&
      "model" in values &&
      "model_id" in values &&
      "text" in values
    ) {
      return true;
    } else {
      return false;
    }
  }

  async getNote(id: any) {
    return await this.getOne(id);
  }

  async getNoteByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getNotes(queryParams: any) {
    return await this.getAll(queryParams, true);
  }

  async addNote(values: any) {
    return await this.addOne(values);
  }

  async updateNote(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteNote(id: any) {
    return await this.deleteOne(id);
  }
}
