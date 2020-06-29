import { IAudit, Audit } from "../models/Audit.ts";
import { ErrorResponse } from "../util/errorResponse.ts";
const audit = new Audit();

export const auditLog = async (
  model: string,
  model_id: number,
  action: string,
  user_id: number,
  parent?: { parent_model: string; parent_model_id: number }
) => {
  const auditBody: IAudit = {
    user_id,
    model,
    model_id,
    action,
    parent_model: parent?.parent_model,
    parent_model_id: parent?.parent_model_id,
  };

  try {
    await audit.addAudit(auditBody);
  } catch (error) {
    throw new ErrorResponse(error, 401);
  }
};
