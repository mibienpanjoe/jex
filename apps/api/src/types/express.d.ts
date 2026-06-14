import "express";

export type UserActor = {
  actorType: "User";
  userId: string;
  sessionId: string;
  actorName: string;
};

export type CICDTokenActor = {
  actorType: "CICDToken";
  tokenId: string;
  actorName: string;
  scopedEnv: string;
};

export type Actor = UserActor | CICDTokenActor;

declare module "express" {
  interface Request {
    actor?: Actor;
  }
}
