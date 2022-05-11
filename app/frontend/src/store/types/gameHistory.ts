import { User } from "./user";

export type GameHistory = {
    id: string;
    user1: User;
    user2: User;
    user1_score: number;
    user2_score: number;
    ended: string;
    winner: string;
    loser: string;
};

