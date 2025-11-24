import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getBalance } from '@/lib/api/wallet';
import { useAuth } from './AuthProvider';

interface BalanceContextValue {
    balance: number;
    loading: boolean;
    refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextValue | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const refreshBalance = useCallback(async () => {
        if (!user) {
            setBalance(0);
            return;
        }

        setLoading(true);
        try {
            const data = await getBalance();
            setBalance(data.balance);
            console.log('[BalanceContext] Balance refreshed:', data.balance);
        } catch (error) {
            console.error('[BalanceContext] Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refreshBalance();
    }, [refreshBalance]);

    return (
        <BalanceContext.Provider value={{ balance, loading, refreshBalance }}>
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
