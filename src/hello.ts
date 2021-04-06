import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";

async function sayHello(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const name: string = request.params.name || "World";
  const response = h.response("Hello " + name);
  response.type('text/plain');
  response.header('X-Custom', 'some-value');
  return response;
}

export const helloRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/hello",
    handler: sayHello
  },
  {
    method: "GET",
    path: "/hello/{name}",
    handler: sayHello
  }
];
