import api from "./axios";
import { MatchDTO, BetDTO } from "../types";

/**
 * Get all matches (public endpoint)
 */
export const getMatches = async (): Promise<MatchDTO[]> => {
    const { data } = await api.get("/matches");
    return data;
};

export const placeBet = async (payload: Partial<BetDTO>): Promise<BetDTO> => {
    const { data } = await api.post("/bets", payload);
    return data;
};

export const getUserBets = async (): Promise<BetDTO[]> => {
    const { data } = await api.get("/bets/user");
    return data;
};
