import React, { createContext, useContext, useState, useCallback } from "react";

export type Bet = {
  id: number;
  match: string;
  type: string;
  odds: number;
  matchId: number;
  betType: "result" | "goals" | "cards" | "corners" | "shots" | string;
  label?: string;
};

export type BetInput = Omit<Bet, "id"> & { id?: number };

interface BettingContextValue {
  selectedBets: Bet[];
  addBet: (bet: BetInput) => void;
  removeBet: (id: number) => void;
  clearBets: () => void;
}

const BettingContext = createContext<BettingContextValue | undefined>(
  undefined
);

export function BettingProvider({ children }: { children: React.ReactNode }) {
  const [selectedBets, setSelectedBets] = useState<Bet[]>([]);

  const addBet = useCallback((bet: BetInput) => {
    setSelectedBets((prev) => {
      // Check if the exact same bet already exists (same match, category, and type)
      const existingBet = prev.find(
        (existingBet) =>
          existingBet.matchId === bet.matchId &&
          existingBet.betType === bet.betType &&
          existingBet.type === bet.type
      );

      // If the exact same bet exists, remove it (toggle off)
      if (existingBet) {
        return prev.filter((b) => b.id !== existingBet.id);
      }

      // Remove any existing bet from the same match and category (but different type)
      const filteredBets = prev.filter(
        (existingBet) =>
          !(existingBet.matchId === bet.matchId && existingBet.betType === bet.betType)
      );

      // CRITICAL: Preserve the optionId (bet.id) from the backend
      // Do NOT generate a new ID with Date.now() - use the actual optionId
      const newBet: Bet = {
        id: bet.id!, // bet.id is the optionId from the backend
        match: bet.match,
        type: bet.type,
        odds: bet.odds,
        matchId: bet.matchId,
        betType: bet.betType,
        label: bet.label,
      };

      console.log('[BettingContext] Adding bet:', newBet);

      // Add the new bet
      return [...filteredBets, newBet];
    });
  }, []);

  const removeBet = useCallback((id: number) => {
    setSelectedBets((prev) => prev.filter((bet) => bet.id !== id));
  }, []);

  const clearBets = useCallback(() => {
    setSelectedBets([]);
  }, []);

  const value = {
    selectedBets,
    addBet,
    removeBet,
    clearBets,
  };

  return (
    <BettingContext.Provider value={value}>{children}</BettingContext.Provider>
  );
}

export function useBetting() {
  const context = useContext(BettingContext);
  if (!context) {
    throw new Error("useBetting must be used within a BettingProvider");
  }
  return context;
}
