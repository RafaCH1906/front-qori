import api from "./axios";

export interface BalanceResponse {
    balance: number;
    currency: string;
    freeBetsCount: number;
}

export interface DepositRequest {
    amount: number;
    paymentMethod: string;
}

/**
 * Get user's current balance
 */
export const getBalance = async (): Promise<BalanceResponse> => {
    console.log('[wallet.ts] Calling GET /wallet/balance...');
    const response = await api.get("/wallet/balance");
    console.log('[wallet.ts] Raw API response:', response);
    console.log('[wallet.ts] Response data:', response.data);
    console.log('[wallet.ts] Response data type:', typeof response.data);
    console.log('[wallet.ts] Balance value:', response.data.balance, 'Type:', typeof response.data.balance);
    return response.data;
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
