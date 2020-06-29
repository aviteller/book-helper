import { DB } from "../helpers/DB.ts";

import { HttpError } from "https://deno.land/x/oak/mod.ts";
export interface IJob {
  id?: string;
  user_id?: number;
  company_id: number;
  title: string;
  description?: string;
  minimum_skill?: string;
  pay?: number;
}

export class Job extends DB {
  table = "jobs";

  belongsTo = {
    selector: "company_id",
    alias: "c",
    table: "companies",
    fields: "id,name",
  };
  //make function in higher class
  validate(values: any) {
    if ("title" in values) {
      return true;
    } else {
      return false;
    }
  }

  async getJob(id: any) {
    return await this.getOne(id);
  }

  async getJobByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getJobs(queryParams: any) {
    return await this.getAll(queryParams, true);
  }

  async getJobsByCompanyID(id: any) {
    return await this.getAllByValue("company_id", id);
  }

  async addJob(values: any) {
    return await this.addOne(values);
  }

  async updateJob(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteJob(id: any) {
    return await this.deleteOne(id);
  }
}
