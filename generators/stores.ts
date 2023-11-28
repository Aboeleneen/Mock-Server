import { faker } from "@faker-js/faker";
import { STORE_IDS } from "../constants";
import { writeFileSync } from 'fs';
import jsonfile from 'jsonfile';
export interface Store {
    merchantId: string;
    leadId: string | null;
    merchantType: string;
    merchantStatus: string;
    tag: string;
    counterparty: string;
    createdBy: string;
    updatedBy: string | undefined;
    createdDate: Date;
    updatedDate: Date | undefined;
    deletedFlag: boolean;
    merchantDetails: MerchantDetails;
}

export interface MerchantDetails {
    merchantDetailsId: string;
    merchantId: string;
    businessType: string;
    outletType: string;
    mcc: string;
    businessDomain: string;
    legalName: string;
    legalNameAr: string;
    tradingName: string;
    nickname: string;
    tradingCurrency: string;
    registrationNumber: string;
    vatNumber: string;
}

export interface StoresResponse {
    stores: Store[];
}

export const generateStores = () => {
    const stores: Store[] = [];
    for (let i = 0; i < STORE_IDS.length; i++) {
        stores.push({
            merchantId: STORE_IDS[i],
            leadId: faker.string.uuid(),
            merchantType: faker.helpers.arrayElement(["Type 1", "Type 2", "Type 3"]),
            merchantStatus: faker.helpers.arrayElement(["Active", "Inactive"]),
            tag: faker.helpers.arrayElement(["Tag 1", "Tag 2", "Tag 3"]),
            counterparty: faker.location.countryCode(),
            createdBy: faker.person.firstName(),
            updatedBy: faker.person.firstName(),
            createdDate: faker.date.past(),
            updatedDate: faker.date.past(),
            deletedFlag: false,
            merchantDetails: {
                merchantDetailsId: faker.string.uuid(),
                merchantId: STORE_IDS[i],
                businessType: faker.helpers.arrayElement(["Business Type 1", "Business Type 2", "Business Type 3"]),
                outletType: faker.helpers.arrayElement(["Outlet Type 1", "Outlet Type 2", "Outlet Type 3"]),
                mcc: faker.string.alphanumeric(),
                businessDomain: faker.helpers.arrayElement(["Domain 1", "Domain 2", "Domain 3"]),
                legalName: `Store ${i + 1}`,
                legalNameAr:`Store ${i + 1} - Ar`,
                tradingName: `Store ${i + 1}`,
                nickname: `Store ${i + 1}`,
                tradingCurrency: faker.finance.currencyCode(),
                registrationNumber: faker.string.alphanumeric(),
                vatNumber: faker.string.alphanumeric()
            }
        })
    }
    writeFileSync("data/stores.json", JSON.stringify(stores), 'utf8');

    return stores;
}

export const generateStoresResponse = async (): Promise<StoresResponse> => {
    const stores: Store[] = await jsonfile.readFile('./data/stores.json');

    return {
        stores
    };
};