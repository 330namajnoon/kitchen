import path from "node:path";

import type { NextFunction, Request, Response } from "express";

import { env } from "@/config/env";

// express.static ya sirve los archivos reales del build (JS, CSS, index.html) antes de llegar
// aquí. Esto solo cubre rutas de cliente de React (ej. /products/5 tras un refresh) que no
// existen como archivo: les devolvemos el index.html para que react-router las resuelva.
export function spaFallback(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "GET" || req.path.startsWith("/api/")) return next();

  res.sendFile(path.resolve(env.staticDir, "index.html"), (err) => {
    if (err) next(err);
  });
}
