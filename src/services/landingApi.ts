import api, { publicApi } from "../lib/api";

// Define types for known landing content
export interface PricingPlan {
    basic: number;
    premium: number;
}

export interface PricingContent {
    sekolah: PricingPlan;
    pesantren: PricingPlan;
    hybrid: PricingPlan;
}

export interface FeatureItem {
    title: string;
    desc: string;
    icon: string;
}

export const landingApi = {
    // Public access
    get: async (key: string) => {
        // Try catch to handle missing content gracefully
        try {
            const response = await publicApi.get(`/public/landing/${key}`);
            return response.data.data;
        } catch (error) {
            console.warn(`Failed to fetch landing content for key: ${key}`, error);
            return null;
        }
    },

    // Owner access
    update: async (key: string, value: any) => {
        const response = await api.put(`/owner/landing/${key}`, value);
        return response.data;
    }
};
