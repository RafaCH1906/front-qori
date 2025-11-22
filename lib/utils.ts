export const formatCurrency = (amount: number, currency: string = "S/") => {
    return `${currency} ${amount.toFixed(2)}`;
};

export const formatOdds = (odds: number) => {
    return odds.toFixed(2);
};

export const calculatePotentialWinnings = (stake: number, odds: number) => {
    return stake * odds;
};

export const calculateTotalOdds = (bets: Array<{ odds: number }>) => {
    return bets.reduce((acc, bet) => acc * bet.odds, 1);
};
