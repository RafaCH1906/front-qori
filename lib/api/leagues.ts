import api from "./axios";

export interface League {
    id: number;
    name: string;
    type: string;
    country: string;
    logo?: string | null;
    logoUrl?: string | null;
    Category?: string;
    idApi?: number;
}

export const getLeagues = async (): Promise<League[]> => {
    const { data } = await api.get("/leagues");
    return data;
};
