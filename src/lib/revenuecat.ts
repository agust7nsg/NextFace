import {
  Purchases,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
} from '@revenuecat/purchases-capacitor';
import type {
  PurchasesOfferings,
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
} from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

const REVENUECAT_ANDROID_API_KEY = 'goog_bPhOuNYGmMmSTNLLQDFgVZwGzQD';
export const PREMIUM_ENTITLEMENT_ID = 'NextFace Premium';

let configured = false;

export async function configureRevenueCat(appUserID: string | null): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({
    apiKey: REVENUECAT_ANDROID_API_KEY,
    appUserID: appUserID ?? undefined,
  });
  configured = true;
}

export async function loginRevenueCatUser(appUserID: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || !configured) {
    return;
  }
  await Purchases.logIn({ appUserID });
}

export async function logoutRevenueCatUser(): Promise<void> {
  if (!Capacitor.isNativePlatform() || !configured) {
    return;
  }
  await Purchases.logOut();
}

export function isRevenueCatConfigured(): boolean {
  return configured;
}

export async function getOfferings(): Promise<PurchasesOfferings | null> {
  if (!Capacitor.isNativePlatform() || !configured) {
    return null;
  }
  const offerings = await Purchases.getOfferings();
  return offerings;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  if (!Capacitor.isNativePlatform() || !configured) {
    throw new Error('Purchases are only available on the native Android app.');
  }
  const result = await Purchases.purchasePackage({ aPackage: pkg });
  return result.customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  if (!Capacitor.isNativePlatform() || !configured) {
    throw new Error('Restore is only available on the native Android app.');
  }
  const result = await Purchases.restorePurchases();
  return result.customerInfo;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  if (!Capacitor.isNativePlatform() || !configured) {
    throw new Error('RevenueCat is only available on the native Android app.');
  }
  const info = await Purchases.getCustomerInfo();
  return info;
}

export function hasPremiumEntitlement(customerInfo: CustomerInfo): boolean {
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

export function isUserCancelledError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const rcError = error as PurchasesError;
    return rcError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
  }
  return false;
}

export function getPurchaseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as PurchasesError).message;
  }
  return 'An unexpected error occurred. Please try again.';
}
