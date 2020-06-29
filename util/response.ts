export const makeResponse = (
  { response }: { response: any },
  status?: number,
  success?: boolean,
  data?: any
) => {
  // let response: Response = new Response();

  response.status = status;
  response.body = {
    success: success ? true : false,
    data,
  };

  return response;
};
