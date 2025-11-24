import api from './axios';

export interface SlideshowSlide {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    emoji: string;
    displayOrder: number;
}

export interface GiftReward {
    eventId: number;
    rewardType: string;
    rewardAmount: number;
    rewardDescription: string;
    message: string;
}

export const promotionsApi = {
    getSlideshow: async (): Promise<SlideshowSlide[]> => {
        const response = await api.get('/promotions/slideshow');
        return response.data;
    },

    openGift: async (): Promise<GiftReward> => {
        const response = await api.post('/promotions/gift/open');
        return response.data;
    },
};
