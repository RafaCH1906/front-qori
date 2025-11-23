import api from "./axios";

export interface BetSelection {
    optionId: number;
    odds: number;
}

export interface PlaceBetRequest {
    userId: number;
    totalStake: number;
    selections: BetSelection[];
}

export interface BetResponse {
    id: number;
    userId: number;
    totalStake: number;
    totalOdds: number;
    potentialWinnings: number;
    status: string;
    placedAt: string;
    selections: BetSelection[];
}

/**
 * Place a new bet
 */
export const placeBet = async (request: PlaceBetRequest): Promise<BetResponse> => {
    const { data } = await api.post("/bets", request);
    return data;
};

/**
 * Get user's bet history
 */
export const getBetHistory = async (userId: number): Promise<BetResponse[]> => {
    const { data } = await api.get(`/bets/user/${userId}`);
    return data;
};

/**
 * Get bet by ID
 */
export const getBetById = async (betId: number): Promise<BetResponse> => {
    const { data } = await api.get(`/bets/${betId}`);
    return data;
};

/**
 * Get user's bets by status
 */
export const getBetsByStatus = async (userId: number, status: string): Promise<BetResponse[]> => {
    const { data } = await api.get(`/bets/user/${userId}/state/${status}`);
    return data;
};
