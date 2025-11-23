// TypeScript interfaces matching backend DTOs

export interface TeamDTO {
    id: number;
    name: string;
    country?: string;
    logo?: string;
}

export interface LeagueDTO {
    id: number;
    name: string;
    country?: string;
    logo?: string;
}
result ?: 'WON' | 'LOST' | 'VOID';
}

export interface MarketDTO {
    id: number;
    matchId: number;
    name: string;
    type: string;
    status: 'OPEN' | 'CLOSED' | 'SETTLED';
    options: OptionDTO[];
}

export interface SelectionDTO {
    id?: number;
    optionId: number;
    odd: number;
    result?: 'WON' | 'LOST' | 'VOID';
}

export interface BetDTO {
    id?: number;
    userId: number;
    totalStake: number;
    totalOdds: number;
    potentialWin: number;
    state: 'PENDING' | 'WON' | 'LOST' | 'VOID';
    betType: 'SIMPLE' | 'COMBINED';
    placedAt?: string;
    settledAt?: string;
    selections: SelectionDTO[];
}

export interface PromotionDTO {
    id: number;
    name: string;
    description: string;
    type: string;
    value: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

// Frontend-specific types for UI
export interface League {
    id: string;
    name: string;
    country: string;
    emoji: string;
}

export interface Match {
    id: number;
    league: string;
    homeTeam: string;
    awayTeam: string;
    time: string;
    odds: { home: number; draw: number; away: number };
}
