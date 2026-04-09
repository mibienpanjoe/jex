import "express";

export type UserActor = {
  actorType: "User";
  userId: string;
};

export type CICDTokenActor = {
  actorType: "CICDToken";
  tokenId: string;
  scopedEnv: string;
};

export type Actor = UserActor | CICDTokenActor;

declare module "express" {
  interface Request {
    actor?: Actor;
  }
}
