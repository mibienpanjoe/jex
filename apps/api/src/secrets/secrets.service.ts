import { PrismaClient } from "@prisma/client";
import { Actor } from "../types/express";
import { authorize } from "../access/access.policy";
import { encrypt, decrypt } from "../crypto/crypto.service";
import {
  listSecretKeys,
  getSecret,
  getAllSecrets,
  upsertSecret,
  deleteSecret,
} from "../vault/vault.store";
import { record } from "../audit/audit.log";

const prisma = new PrismaClient();

// ─── List key names (no values) ───────────────────────────────────────────────

export async function listKeys(actor: Actor, projectId: string, env: string) {
  await authorize(actor, "read", projectId, env);
  return listSecretKeys(projectId, env);
}

// ─── Get a single secret (decrypted) ─────────────────────────────────────────

export async function getSecretValue(
  actor: Actor,
  projectId: string,
  env: string,
  key: string
): Promise<string> {
  await authorize(actor, "read", projectId, env);

  const row = await getSecret(projectId, env, key);
  if (!row) {
    throw Object.assign(new Error("Secret not found"), { code: "NOT_FOUND" });
  }

  const actorId = actor.actorType === "User" ? actor.userId : actor.tokenId;
  const actorName = actorId;

  await prisma.$transaction(async (tx) => {
    await record(tx, {
      projectId,
      actorId,
      actorName,
      actorType: actor.actorType === "User" ? "User" : "CICDToken",
      operation: "SECRET_READ",
      env,
      key,
    });
  });

  return decrypt(row.ciphertext, row.iv);
}

// ─── Export all secrets for an env (decrypted) ───────────────────────────────

export async function exportSecrets(
  actor: Actor,
  projectId: string,
  env: string
): Promise<Record<string, string>> {
  await authorize(actor, "read", projectId, env);

  const rows = await getAllSecrets(projectId, env);
  const actorId = actor.actorType === "User" ? actor.userId : actor.tokenId;

  await prisma.$transaction(async (tx) => {
    await record(tx, {
      projectId,
      actorId,
      actorName: actorId,
      actorType: actor.actorType === "User" ? "User" : "CICDToken",
      operation: "SECRET_READ_BULK",
      env,
    });
  });

  return Object.fromEntries(rows.map((r) => [r.key, decrypt(r.ciphertext, r.iv)]));
}

// ─── Create or update a single secret ────────────────────────────────────────

export async function setSecret(
  actor: Actor,
  projectId: string,
  env: string,
  key: string,
  value: string,
  isUpdate = false
): Promise<void> {
  await authorize(actor, "write", projectId, env);

  const { ciphertext, iv } = encrypt(value);
  const actorId = actor.actorType === "User" ? actor.userId : actor.tokenId;

  await prisma.$transaction(async (tx) => {
    await upsertSecret(tx, projectId, env, key, ciphertext, iv);
    await record(tx, {
      projectId,
      actorId,
      actorName: actorId,
      actorType: actor.actorType === "User" ? "User" : "CICDToken",
      operation: isUpdate ? "SECRET_UPDATE" : "SECRET_CREATE",
      env,
      key,
    });
  });
}

// ─── Delete a secret ─────────────────────────────────────────────────────────

export async function removeSecret(
  actor: Actor,
  projectId: string,
  env: string,
  key: string
): Promise<void> {
  await authorize(actor, "write", projectId, env);

  const actorId = actor.actorType === "User" ? actor.userId : actor.tokenId;

  await prisma.$transaction(async (tx) => {
    await deleteSecret(tx, projectId, env, key);
    await record(tx, {
      projectId,
      actorId,
      actorName: actorId,
      actorType: actor.actorType === "User" ? "User" : "CICDToken",
      operation: "SECRET_DELETE",
      env,
      key,
    });
  });
}

// ─── Bulk import ──────────────────────────────────────────────────────────────

export async function importSecrets(
  actor: Actor,
  projectId: string,
  env: string,
  pairs: Record<string, string>
): Promise<void> {
  await authorize(actor, "write", projectId, env);

  const actorId = actor.actorType === "User" ? actor.userId : actor.tokenId;
  const entries = Object.entries(pairs);

  await prisma.$transaction(async (tx) => {
    for (const [key, value] of entries) {
      const { ciphertext, iv } = encrypt(value);
      await upsertSecret(tx, projectId, env, key, ciphertext, iv);
    }

    await record(tx, {
      projectId,
      actorId,
      actorName: actorId,
      actorType: actor.actorType === "User" ? "User" : "CICDToken",
      operation: "SECRET_CREATE",
      env,
      key: `[bulk: ${entries.length} keys]`,
    });
  });
}
