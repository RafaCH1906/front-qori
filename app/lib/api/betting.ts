import api from "./axios";

export const getMatches = async () => {
    const { data } = await api.get("/matches");
    return data;
};

export const placeBet = async (payload: any) => {
    const { data } = await api.post("/bets", payload);
    return data;
};

export const getUserBets = async () => {
    const { data } = await api.get("/bets/user");
    return data;
};
