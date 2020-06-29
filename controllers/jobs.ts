import { IJob, Job } from "../models/Job.ts";

const jobModel = new Job();

export class JobController {
  // @desc Get All Jobs
  // @ route GET /api/v1/jobs
  getJobs = async (ctx: any) => {
    // let queryParams = helpers.getQuery(ctx);
    let results = await jobModel.getJobs(ctx);

    ctx.response.status = results.status;
    ctx.response.body = results.body;
  };

  // @desc Get Single Jobs
  // @ route GET /api/v1/jobs/:id

  getJob = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await jobModel.getJob(params.id);
    response.status = results.status;
    response.body = results.body;
  };

  // @desc Add Jobs
  // @ route POST /api/v1/jobs
  addJob = async ({ request, response }: { request: any; response: any }) => {
    // console.log(body.value);
    const body = await request.body();
    if (!request.hasBody) {
      response.status = 400;
      response.body = {
        success: false,
        msg: "No data found",
      };
    } else {
      if (await jobModel.validate(body.value)) {
        const { title, company_id, ...values } = body.value;

        let job: IJob = {
          title,
          company_id,
        };

        job = { ...job, ...values };

        let result = await jobModel.addJob(job);
        response.status = result.status;
        response.body = result.body;
      } else {
        response.status = 404;
        response.body = {
          success: false,
          msg: "Please enter all required values",
        };
      }
    }
  };

  // @desc update Jobs
  // @ route PUT /api/v1/jobs/:id

  updateJob = async ({
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
      let result = await jobModel.updateJob(body.value, params.id);
      response.status = result.status;
      response.body = result.body;
    }
  };

  // @desc Delete Job
  // @ route DELETE  /api/v1/jobs/:id

  deleteJob = async ({
    params,
    response,
  }: {
    params: { id: string };
    response: any;
  }) => {
    let results = await jobModel.deleteJob(params.id);
    response.status = results.status;
    response.body = results.body;
  };
}
