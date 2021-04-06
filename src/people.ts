import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Joi from "joi";
const ValidationError = Joi.ValidationError;

type Person = {
    name: string;
    age: number;
}

const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required()
});

const people: Person[] = [
    { name: "Sophie", age: 37 },
    { name: "Dan", age: 42 }
];

async function showPeople(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    return h.view("people", { people: people });
}

async function addPersonGet(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    let data = ({} as Person);
    return h.view("addPerson", { person: data });
}

async function addPersonPost(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    let data = ({} as Person);
    try {
        data = (request.payload as Person);
        const o = schema.validate(data, { stripUnknown: true });
        if (o.error) {
            throw o.error;
        }
        data = (o.value as Person);
        people.push(data);
        return h.redirect("/people");
    } catch (err) {
      const errors: { [key: string]: string } = {};
      if (err instanceof ValidationError && err.isJoi) {
          for (const detail of err.details) {
              errors[detail.context!.key!] = detail.message;
          }
      } else {
          console.error("error", err, "adding person");
      }

      return h.view("addPerson", { person: data, errors: errors })
    }
}

export const peopleRoutes: ServerRoute[] = [
  { method: "GET", path: "/people", handler: showPeople },
  { method: "GET", path: "/people/add", handler: addPersonGet },
  { method: "POST", path: "/people/add", handler: addPersonPost }  
];
