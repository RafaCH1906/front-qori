import api from "./axios";

export interface BalanceResponse {
    balance: number;
    currency: string;
}

export interface DepositRequest {
    amount: number;
    paymentMethod: string;
}

/**
 * Get user's current balance
 */
export const getBalance = async (): Promise<BalanceResponse> => {
    const { data } = await api.get("/wallet/balance");
    return data;
};

/**
 * Deposit funds to user's wallet
 */
export const deposit = async (request: DepositRequest): Promise<BalanceResponse> => {
    const { data } = await api.post("/wallet/deposit", request);
    return data;
};

/**
 * Withdraw funds from user's wallet
 */
export const withdraw = async (request: DepositRequest): Promise<BalanceResponse> => {
    const { data } = await api.post("/wallet/withdraw", request);
    return data;
};
