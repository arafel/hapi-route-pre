'use strict';

import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";

import { helloRoutes } from "./hello";
import { peopleRoutes } from "./people";

export let server: Server;

function index(request: Request): string {
  return "Hello! Nice to have met you.";
}

async function registerVision(server: Server) {
  let cached: boolean;

  await server.register(hapiVision);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    cached = false;
  } else {
    cached = true;
  }
  server.log(["debug"], `Caching templates: ${cached}`);
  server.views({
    engines: {
      ejs: require("ejs")
    },
    relativeTo: __dirname + "/../",
    path: 'templates',
    isCached: cached
  });
}

export const init = async function(): Promise<Server> {
  server = Hapi.server({
    port: process.env.PORT || 4000,
    host: '0.0.0.0'
  });

  await registerVision(server);

    /* Routes from other modules */
  server.route(helloRoutes);
  server.route(peopleRoutes);

  /* Brief routes from this module */
  server.route({
    method: "GET",
    path: "/",
    handler: index
  });

  return server;
};

export const start = async function (): Promise<void> {
  console.log(`Starting server, listening on ${server.settings.host}:${server.settings.port}`);
  return server.start();
};

process.on('unhandledRejection', (err) => {
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});
