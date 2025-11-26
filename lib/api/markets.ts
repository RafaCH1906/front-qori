import api from "./axios";
import { MarketDTO, OptionDTO } from "../types";

/**
 * Get all active markets (requires authentication)
 */
export const getActiveMarkets = async (): Promise<MarketDTO[]> => {
    const { data } = await api.get("/markets/active");
    return data;
};

/**
 * Get all markets for a specific match (requires authentication)
 */
export const getMarketsByMatch = async (matchId: number): Promise<MarketDTO[]> => {
    const { data } = await api.get(`/markets/match/${matchId}`);
    return data;
};

/**
 * Get options for a specific market (requires authentication)
 */
export const getMarketOptions = async (marketId: number): Promise<OptionDTO[]> => {
    const { data } = await api.get(`/markets/${marketId}/options`);
    return data;
};

/**
 * Get all markets (requires authentication)
 */
export const getAllMarkets = async (): Promise<MarketDTO[]> => {
    const { data } = await api.get("/markets");
    return data;
};
