import { faker } from "@faker-js/faker";
import { STORE_IDS } from "../constants";

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

export const generateStoresResponse = (counterparty: string): StoresResponse => {
    const stores: Store[] = [];

    for (let i = 0; i < STORE_IDS.length; i++) {
        const store: Store = {
            merchantId: STORE_IDS[i],
            leadId: faker.string.uuid(),
            merchantType: faker.helpers.arrayElement(["Type 1", "Type 2", "Type 3"]),
            merchantStatus: faker.helpers.arrayElement(["Active", "Inactive"]),
            tag: faker.helpers.arrayElement(["Tag 1", "Tag 2", "Tag 3"]),
            counterparty: counterparty,
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
                legalName: faker.company.name(),
                legalNameAr: faker.company.name(),
                tradingName: faker.company.name(),
                nickname: faker.random.word(),
                tradingCurrency: faker.finance.currencyCode(),
                registrationNumber: faker.string.alphanumeric(),
                vatNumber: faker.string.alphanumeric()
            }
        };

        stores.push(store);
    }

    const response: StoresResponse = {
        stores
    };

    return response;
};