
export enum Status {
  Offline,
  Online,
  Playing
}


export type User = {
  username: string;
  avatar_id: string;
  win_number: number;
  lose_number: number;
  win_strike: number;
  rating: number;
  status: Status;
  id: string;
  isTwoFactorEnable: boolean;
};

export type AuthData = {
  tfa: boolean;
}
