import { DB } from "../helpers/DB.ts";

export interface IAudit {
  id?: string;
  user_id: number;
  model: string;
  model_id: number;
  action: string;
  parent_model?: string;
  parent_model_id?: number;
}

export class Audit extends DB {
  table = "audits";

  //make function in higher class
  validate(values: any) {
    if (
      "user_id" in values &&
      "model" in values &&
      "model_id" in values &&
      "action" in values
    ) {
      return true;
    } else {
      return false;
    }
  }

  async getAudit(id: any) {
    return await this.getOne(id);
  }

  async getAuditByValue(field: string, value: any) {
    return await this.getOneByValue(field, value);
  }

  async getAudits(queryParams: any) {
    return await this.getAll(queryParams, true);
  }

  async addAudit(values: any) {
    return await this.addOne(values);
  }

  async updateAudit(values: any, id: any) {
    return await this.updateOne(values, id);
  }

  async deleteAudit(id: any) {
    return await this.deleteOne(id);
  }
}
