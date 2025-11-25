import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/lib/api/wallet';
import { useAuth } from './AuthProvider';

interface BalanceContextValue {
    balance: number;
    freeBetsCount: number;
    loading: boolean;
    refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextValue | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState<number>(0);
    const [freeBetsCount, setFreeBetsCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const refreshBalance = useCallback(async () => {
        const timestamp = new Date().toISOString();
        console.log(`[BalanceContext ${timestamp}] Starting balance refresh...`);

        if (!user) {
            console.log(`[BalanceContext ${timestamp}] No user logged in, resetting balance to 0`);
            setBalance(0);
            setFreeBetsCount(0);
            return;
        }

        console.log(`[BalanceContext ${timestamp}] User found: ${user.username} (ID: ${user.id})`);
        setLoading(true);
        try {
            console.log(`[BalanceContext ${timestamp}] Calling getBalance() API...`);
            const data = await getBalance();
            console.log(`[BalanceContext ${timestamp}] API Response:`, {
                balance: data.balance,
                freeBetsCount: data.freeBetsCount,
                currency: data.currency
            });

            setBalance(data.balance);
            setFreeBetsCount(data.freeBetsCount || 0);
            console.log(`[BalanceContext ${timestamp}] ✅ Balance updated successfully:`, {
                newBalance: data.balance,
                newFreeBetsCount: data.freeBetsCount || 0
            });
        } catch (error: any) {
            console.error(`[BalanceContext ${timestamp}] ❌ Failed to fetch balance:`, {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url
            });
        } finally {
            setLoading(false);
            console.log(`[BalanceContext ${timestamp}] Balance refresh completed`);
        }
    }, [user]);

    useEffect(() => {
        refreshBalance();
    }, [refreshBalance]);

    return (
        <BalanceContext.Provider value={{ balance, freeBetsCount, loading, refreshBalance }}>
            {children}
        </BalanceContext.Provider>
    );
}

export function useBalance() {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within BalanceProvider');
    }
    return context;
}
