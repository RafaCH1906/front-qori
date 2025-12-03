import api from "./axios";
import { MatchDTO, LeagueDTO } from "../types";

interface UpcomingMatchesParams {
    page?: number;
    limit?: number;
    leagueId?: number | null;
}

export const getUpcomingMatches = async (
    { page = 0, limit = 5, leagueId }: UpcomingMatchesParams = {}
): Promise<MatchDTO[]> => {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (typeof leagueId === "number") {
        query.append("leagueId", leagueId.toString());
    }

    const { data } = await api.get(`/matches/upcoming?${query.toString()}`);
    return data;
};

export const getFinishedMatches = async (limit: number = 5): Promise<MatchDTO[]> => {
    const { data } = await api.get(`/matches/by-status?status=FINISHED&limit=${limit}`);
    return data;
};

export const getLeagues = async (): Promise<LeagueDTO[]> => {
    const { data } = await api.get("/leagues");
    return data;
};

export const getMatchById = async (id: number): Promise<MatchDTO> => {
    const { data } = await api.get(`/matches/${id}`);
    return data;
};

export const getMatchesByLeague = async (leagueId: number): Promise<MatchDTO[]> => {
    const { data } = await api.get(`/leagues/${leagueId}/matches`);
    return data;
};

export const getOdds = async (): Promise<any[]> => {
    const { data } = await api.get("/odds");
    return data;
};

export const getOptions = async (): Promise<any[]> => {
    const { data } = await api.get("/options");
    return data;
};

export const getMarketsByMatch = async (matchId: number) => {
    const { data } = await api.get(`/markets/match/${matchId}`);
    return data;
};

export const getMarketOptions = async (marketId: number) => {
    const { data } = await api.get(`/markets/${marketId}/options`);
    return data;
};
