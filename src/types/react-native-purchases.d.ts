declare module 'react-native-purchases' {
  export const LOG_LEVEL: {
    DEBUG: string;
    WARN: string;
  };

  export const PACKAGE_TYPE: {
    MONTHLY: string;
    ANNUAL: string;
  };

  export type PurchasesPackage = {
    product: {
      identifier: string;
      priceString: string;
      introPrice?: { priceString: string } | null;
    };
    packageType: string;
  };

  export type CustomerInfo = {
    entitlements: {
      active: Record<
        string,
        {
          expirationDate: string | null;
          willRenew: boolean;
          productIdentifier: string;
        }
      >;
    };
    requestDate?: string;
  };

  export type PurchasesOfferings = {
    current?: {
      availablePackages: PurchasesPackage[];
      monthly?: PurchasesPackage;
      annual?: PurchasesPackage;
    };
  };

  const Purchases: {
    setLogLevel: (level: string) => void;
    configure: (options: { apiKey: string; appUserID?: string }) => void;
    logIn: (userId: string) => Promise<{ customerInfo: CustomerInfo }>;
    logOut: () => Promise<{ customerInfo: CustomerInfo }>;
    getCustomerInfo: () => Promise<CustomerInfo>;
    getOfferings: () => Promise<PurchasesOfferings>;
    purchasePackage: (pkg: PurchasesPackage) => Promise<{ customerInfo: CustomerInfo }>;
    restorePurchases: () => Promise<CustomerInfo>;
  };

  export default Purchases;
}
