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

export interface MatchDTO {
    id: number;
    homeTeam: TeamDTO;
    awayTeam: TeamDTO;
    league: LeagueDTO;
    date: string;
    state: string;
    homeLogo?: string;
    awayLogo?: string;
    homegoals?: number;
    awaygoals?: number;
    homecards?: number;
    awaycards?: number;
    homeshots?: number;
    awayshots?: number;
    homecorners?: number;
    awaycorners?: number;

    // Match odds
    localOdds?: number;
    drawOdds?: number;
    awayOdds?: number;

    // Option IDs for betting
    localOptionId?: number;
    drawOptionId?: number;
    awayOptionId?: number;
}

export interface OptionDTO {
    id: number;
    name: string;
    odd: number;
    result?: 'WON' | 'LOST' | 'VOID';
}

export interface MarketOption {
    id: number;
    name: string; // HOME, AWAY, X, OVER, UNDER
    line?: number; // Para Over/Under (ej: 2.5)
    odd: number;
    scope: string; // TOTAL, HOME, AWAY
    description?: string;
}

export interface MarketDTO {
    id: number;
    matchId: number;
    type: string; // RESULT, GOALS, CARDS, SHOTS, CORNERS
    description: string;
    active: boolean;
    options?: MarketOption[];
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
