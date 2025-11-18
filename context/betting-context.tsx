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
    setSelectedBets((prev) => [
      ...prev,
      {
        id: bet.id ?? Date.now(),
        ...bet,
      },
    ]);
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
