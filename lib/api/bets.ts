import api from "./axios";

export interface BetSelection {
    optionId: number;
    oddsTaken: number; // Backend expects oddsTaken as BigDecimal
    matchId?: number; // Optional matchId for validation
}

export interface PlaceBetRequest {
    userId: number;
    totalStake: number;
    selections: BetSelection[];
    useFreeBet?: boolean;
    matchId?: number; // For single bets
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
 * Get user's bet history (uses authenticated user from token)
 */
export const getBetHistory = async (): Promise<BetResponse[]> => {
    const { data } = await api.get(`/bets/user/me`);
    return data;
};

/**
 * Get user's bet history by userId (admin only)
 */
export const getBetHistoryByUserId = async (userId: number): Promise<BetResponse[]> => {
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
