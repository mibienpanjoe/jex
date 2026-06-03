import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Server } from "node:http";
import { after, before, beforeEach, test, type TestContext } from "node:test";
import type { PrismaClient } from "@prisma/client";

process.env.ENCRYPTION_KEY ??= "a".repeat(64);
process.env.BETTER_AUTH_SECRET ??= "integration-test-better-auth-secret";
process.env.BETTER_AUTH_URL ??= "http://127.0.0.1:3001";
process.env.WEB_ORIGIN ??= "http://localhost:3000";

const integrationEnabled = process.env.JEX_INTEGRATION_TESTS === "1";
const hasDatabase = Boolean(process.env.DATABASE_URL);
const userToken = "user_session_token";
const ciToken = "jex_integration_token";

let prisma: PrismaClient | undefined;
let server: Server | undefined;
let baseURL = "";

before(async () => {
  if (!integrationEnabled || !hasDatabase) return;

  const prismaModule = await import("@prisma/client");
  prisma = new prismaModule.PrismaClient();
  await prisma.$connect();

  const { createApp } = await import("../app");
  await new Promise<void>((resolve, reject) => {
    server = createApp().listen(0, "127.0.0.1", (err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const address = server?.address();
  assert(address && typeof address === "object");
  baseURL = `http://127.0.0.1:${address.port}`;
});

beforeEach(async () => {
  if (!integrationEnabled || !hasDatabase || !prisma) return;
  await resetDatabase(prisma);
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((err) => (err ? reject(err) : resolve()));
  });
  await prisma?.$disconnect();
});

test("CI/CD token can read only its scoped environment", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const allowed = await api("/api/v1/projects/project_1/secrets?env=dev", {
    headers: bearer(ciToken),
  });
  assert.equal(allowed.status, 200);
  const allowedBody = (await allowed.json()) as Array<{
    key: string;
    createdAt: string;
    updatedAt: string;
  }>;
  assert.equal(allowedBody.length, 1);
  assert.equal(allowedBody[0]?.key, "DATABASE_URL");
  assert.equal(typeof allowedBody[0]?.createdAt, "string");
  assert.equal(typeof allowedBody[0]?.updatedAt, "string");

  const denied = await api("/api/v1/projects/project_1/secrets?env=prod", {
    headers: bearer(ciToken),
  });
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), { error: "INSUFFICIENT_PERMISSIONS" });
});

test("CI/CD token cannot mutate secrets", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const writeRequests = [
    api("/api/v1/projects/project_1/secrets", {
      method: "POST",
      headers: jsonBearer(ciToken),
      body: JSON.stringify({ env: "dev", key: "NEW_SECRET", value: "secret" }),
    }),
    api("/api/v1/projects/project_1/secrets/DATABASE_URL?env=dev", {
      method: "PUT",
      headers: jsonBearer(ciToken),
      body: JSON.stringify({ value: "changed" }),
    }),
    api("/api/v1/projects/project_1/secrets/DATABASE_URL?env=dev", {
      method: "DELETE",
      headers: bearer(ciToken),
    }),
    api("/api/v1/projects/project_1/secrets/import", {
      method: "POST",
      headers: jsonBearer(ciToken),
      body: JSON.stringify({ env: "dev", secrets: { ANOTHER_SECRET: "value" } }),
    }),
  ];

  for (const response of await Promise.all(writeRequests)) {
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "INSUFFICIENT_PERMISSIONS" });
  }
});

test("CI/CD token cannot access management routes", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const managementRequests = [
    api("/api/v1/projects", { headers: bearer(ciToken) }),
    api("/api/v1/projects/project_1/envs", { headers: bearer(ciToken) }),
    api("/api/v1/projects/project_1/audit", { headers: bearer(ciToken) }),
    api("/api/v1/projects/project_1/members", { headers: bearer(ciToken) }),
    api("/api/v1/projects/project_1/tokens", { headers: bearer(ciToken) }),
  ];

  for (const response of await Promise.all(managementRequests)) {
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "FORBIDDEN" });
  }
});

test("user bearer session can access dashboard API routes", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const projects = await api("/api/v1/projects", { headers: bearer(userToken) });
  assert.equal(projects.status, 200);
  const projectBody = (await projects.json()) as Array<{ id: string; role: string }>;
  assert.equal(projectBody[0]?.id, "project_1");
  assert.equal(projectBody[0]?.role, "Owner");

  const sessions = await api("/api/v1/auth/sessions", { headers: bearer(userToken) });
  assert.equal(sessions.status, 200);
  const sessionBody = (await sessions.json()) as Array<{ id: string }>;
  assert.equal(sessionBody[0]?.id, "session_1");
});

test("revoked user session is rejected immediately", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  await prisma!.session.update({
    where: { id: "session_1" },
    data: { revokedAt: new Date() },
  });

  const response = await api("/api/v1/projects", { headers: bearer(userToken) });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "UNAUTHORIZED" });
});

test("DELETE /auth/sessions/current revokes the current bearer session", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const revoke = await api("/api/v1/auth/sessions/current", {
    method: "DELETE",
    headers: bearer(userToken),
  });
  assert.equal(revoke.status, 204);

  const session = await prisma!.session.findUniqueOrThrow({
    where: { id: "session_1" },
  });
  assert.notEqual(session.revokedAt, null);

  const afterRevoke = await api("/api/v1/projects", { headers: bearer(userToken) });
  assert.equal(afterRevoke.status, 401);
});

test("CLI callback rejects non-loopback redirects", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const response = await api(
    "/api/v1/auth/cli-callback?redirect=https%3A%2F%2Fevil.example%2Fcallback",
  );
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "INVALID_REDIRECT" });
});

test("CLI callback redirects unauthenticated browsers to web login", async (t) => {
  if (!requireDatabase(t)) return;
  await seedProject();

  const redirect = encodeURIComponent("http://127.0.0.1:49231/callback");
  const response = await api(`/api/v1/auth/cli-callback?redirect=${redirect}`);

  assert.equal(response.status, 302);
  const location = response.headers.get("location");
  assert(location);
  assert(location.startsWith("http://localhost:3000/login?callbackURL="));
  assert(location.includes(encodeURIComponent("/api/v1/auth/cli-callback")));
});

function requireDatabase(t: TestContext): boolean {
  if (!hasDatabase) {
    t.skip("Set DATABASE_URL to run API integration tests against a disposable database.");
    return false;
  }
  if (!integrationEnabled) {
    t.skip("Set JEX_INTEGRATION_TESTS=1 to run destructive API integration tests.");
    return false;
  }
  return true;
}

async function api(path: string, init: RequestInit = {}) {
  return fetch(`${baseURL}${path}`, { redirect: "manual", ...init });
}

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function jsonBearer(token: string) {
  return { ...bearer(token), "Content-Type": "application/json" };
}

async function resetDatabase(db: PrismaClient) {
  await db.auditEvent.deleteMany();
  await db.secret.deleteMany();
  await db.cICDToken.deleteMany();
  await db.environment.deleteMany();
  await db.projectMember.deleteMany();
  await db.project.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.twoFactor.deleteMany();
  await db.verification.deleteMany();
  await db.user.deleteMany();
}

async function seedProject() {
  const db = prisma!;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const { encrypt } = await import("../crypto/crypto.service");
  const encrypted = encrypt("postgres://example");

  await db.user.create({
    data: {
      id: "user_1",
      name: "Owner",
      email: "owner@example.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });

  await db.session.create({
    data: {
      id: "session_1",
      token: userToken,
      userId: "user_1",
      expiresAt,
      createdAt: now,
      updatedAt: now,
    },
  });

  await db.project.create({
    data: {
      id: "project_1",
      name: "Demo Project",
      members: {
        create: {
          userId: "user_1",
          role: "Owner",
        },
      },
      environments: {
        createMany: {
          data: [
            { name: "dev", isDefault: true },
            { name: "prod", isDefault: false },
          ],
        },
      },
      secrets: {
        create: {
          environment: "dev",
          key: "DATABASE_URL",
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        },
      },
      cicdTokens: {
        create: {
          name: "Deploy",
          tokenHash: createHash("sha256").update(ciToken).digest("hex"),
          scopedEnv: "dev",
        },
      },
    },
  });
}
