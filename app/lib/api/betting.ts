import api from "./axios";

export type BetData = {
  matchId: number;
  betType: string;
  odds: number;
  amount: number;
  [key: string]: any;
};

export async function getMatches() {
  const response = await api.get("/matches");
  return response.data;
}

export async function getMatch(id: string) {
  const response = await api.get(`/matches/${id}`);
  return response.data;
}

export async function placeBet(betData: BetData) {
  const response = await api.post("/bets", betData);
  return response.data;
}

export async function getUserBets() {
  const response = await api.get("/bets/user");
  return response.data;
}

export async function getBetHistory() {
  const response = await api.get("/bets/history");
  return response.data;
}
