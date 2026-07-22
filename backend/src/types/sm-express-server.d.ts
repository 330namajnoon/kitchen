declare module "sm-express-server" {
  import type { Request, RequestHandler, Response, Router } from "express";
  import type { Server as HttpServer } from "http";
  import type multer from "multer";
  import type { Server as SocketIoServer } from "socket.io";

  export interface RouterDefinition {
    path: string;
    router: Router;
  }

  export interface ControllerDefinition {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    storage: RequestHandler;
    callback: RequestHandler;
  }

  export class Server {
    app: import("express").Application;
    server: HttpServer;
    port: number;
    direction: string;
    routers: RouterDefinition[];
    controllers: ControllerDefinition[];

    constructor(
      port?: number,
      direction?: string,
      use?: RequestHandler[],
      routers?: RouterDefinition[],
      controllers?: ControllerDefinition[],
    );

    start(callback: () => void): void;
    addControllers(controllers: ControllerDefinition[]): void;
  }

  export function createController(
    action: (req: Request, res: Response) => void,
  ): RequestHandler;

  export function createRouter(
    path: string,
    callback: (router: Router) => void,
  ): RouterDefinition;

  export function createStorage(fileDirection?: string): multer.Multer;

  export interface SocketControllerDefinition {
    name: string;
    callback: (...args: unknown[]) => unknown;
    broadcast: boolean;
  }

  export function createSocketController(
    name?: string,
    callback?: (...args: unknown[]) => unknown,
    broadcast?: boolean,
  ): SocketControllerDefinition;

  export class SocketIo {
    io: SocketIoServer;
    socketControllers: SocketControllerDefinition[];
    constructor(
      server: HttpServer,
      originCors?: string,
      socketControllers?: SocketControllerDefinition[],
    );
  }
}
