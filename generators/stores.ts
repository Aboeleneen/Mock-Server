import { STORE_IDS } from "../constants";
export interface Store {
    merchantId?: string;
    businessId: string;
    legalName: string;
}
export interface StoresResponse {
    stores: Store[];
}

export const generateStoresResponse = async (): Promise<StoresResponse> => {

    return {
        stores: STORE_IDS.map((storeId, index) => ({ businessId: storeId, legalName: `Store ${index + 1}` }))
    };
};