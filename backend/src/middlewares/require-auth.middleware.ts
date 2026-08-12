import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtHeader, type SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

import { env } from "@/config/env";

// Access tokens emitidos por auth-server (repo aparte) via Resource Indicators (RFC 8707).
// Como todavía no hay un resource indicator propio para kitchen-api, el audience configurado
// ahí es el propio issuer (ver defaultResource en auth-server/src/config/provider.ts) — se
// revisará cuando exista un segundo resource server real.
const client = jwksClient({ jwksUri: `${env.authIssuer}/jwks` });

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err || !key) return callback(err ?? new Error("signing key not found"));
    callback(null, key.getPublicKey());
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/health") return next();

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) {
    res.status(401).json({ error: "missing access token" });
    return;
  }

  jwt.verify(
    token,
    getKey,
    { issuer: env.authIssuer, audience: env.authIssuer, algorithms: ["RS256", "PS256", "ES256"] },
    (err, decoded) => {
      if (err || !decoded || typeof decoded === "string") {
        res.status(401).json({ error: "invalid access token" });
        return;
      }

      req.user = { sub: decoded.sub as string, email: decoded.email as string | undefined };
      next();
    },
  );
}
