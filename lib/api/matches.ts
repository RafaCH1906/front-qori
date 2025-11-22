import api from "./axios";
import { MatchDTO, LeagueDTO } from "../types";

/**
 * Get all matches (public endpoint, no auth required)
 */
export const getUpcomingMatches = async (): Promise<MatchDTO[]> => {
    const { data } = await api.get("/matches");
    return data;
};

/**
 * Get all leagues (public endpoint, no auth required)
 */
export const getLeagues = async (): Promise<LeagueDTO[]> => {
    const { data } = await api.get("/leagues");
    return data;
};

/**
 * Get a single match by ID (public endpoint, no auth required)
 */
export const getMatchById = async (id: number): Promise<MatchDTO> => {
    const { data } = await api.get(`/matches/${id}`);
    return data;
};

/**
 * Get matches for a specific league (public endpoint, no auth required)
 */
export const getMatchesByLeague = async (leagueId: number): Promise<MatchDTO[]> => {
    const { data } = await api.get(`/leagues/${leagueId}/matches`);
    return data;
};
