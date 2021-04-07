import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Boom from "@hapi/boom";
import Joi from "joi";
const ValidationError = Joi.ValidationError;

type Person = {
    id: number,
    name: string;
    age: number;
}

const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required()
});

const people: Person[] = [
    { id: 1, name: "Sophie", age: 37 },
    { id: 2, name: "Dan",    age: 42 }
];

async function showPeople(_request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    return h.view("people", { people: people });
}

async function showPerson(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    return h.view("person", { person: request.pre.person });
}

async function addPersonGet(_request: Request, h: ResponseToolkit): Promise<ResponseObject> {
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
          throw Boom.badImplementation("Error adding person");
      }

      return h.view("addPerson", { person: data, errors: errors })
    }
}

async function deletePerson(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  return h.view("deleted", { id: request.pre.person.id });
}

async function checkPerson(request: Request, h: ResponseToolkit): Promise<Person | undefined> {
  if (!request.params.personId) {
    throw Boom.badRequest("No personId found");
  }

  try {
    const person = people.find(person => person.id == parseInt(request.params.personId));
    if (!person) {
      throw Boom.notFound("Person not found");
    }
    return person;
  } catch (err) {
    console.error("Error", err, "finding person");
    throw Boom.badImplementation("Error finding person");
  }
}
const checkPersonPre = { method: checkPerson, assign: "person" };

export const peopleRoutes: ServerRoute[] = [
  { method: "GET", path: "/people", handler: showPeople },
  { method: "GET", path: "/people/{personId}", handler: showPerson, options: { pre: [checkPersonPre] } },
  { method: "POST", path: "/people/{personId}/delete", handler: deletePerson, options: { pre: [checkPersonPre] } },
  { method: "GET", path: "/people/add", handler: addPersonGet },
  { method: "POST", path: "/people/add", handler: addPersonPost }  
];
