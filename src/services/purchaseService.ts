import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import {
  REVENUECAT_API_KEY_IOS,
  REVENUECAT_API_KEY_ANDROID,
  ENTITLEMENT_PRO,
} from '../constants/subscriptionTiers';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

export async function initPurchases(): Promise<void> {
  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    const apiKey = Platform.OS === 'ios'
      ? REVENUECAT_API_KEY_IOS
      : REVENUECAT_API_KEY_ANDROID;

    await Purchases.configure({ apiKey });
    await refreshProStatus();
  } catch (e) {
    // RevenueCat not configured yet — dev mode
    console.log('[RevenueCat] Not configured, running in free mode');
  }
}

export async function refreshProStatus(): Promise<void> {
  try {
    const info = await Purchases.getCustomerInfo();
    const isPro = info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
    useSubscriptionStore.getState().setIsPro(isPro);
  } catch {
    useSubscriptionStore.getState().setIsPro(false);
  }
}

export async function purchasePackage(pkg: import('react-native-purchases').PurchasesPackage): Promise<boolean> {
  try {
    useSubscriptionStore.getState().setLoading(true);
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = customerInfo.entitlements.active[ENTITLEMENT_PRO] !== undefined;
    useSubscriptionStore.getState().setIsPro(isPro);
    return isPro;
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean };
    if (!err.userCancelled) {
      console.error('[Purchase error]', e);
    }
    return false;
  } finally {
    useSubscriptionStore.getState().setLoading(false);
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    useSubscriptionStore.getState().setLoading(true);
    const info = await Purchases.restorePurchases();
    const isPro = info.entitlements.active[ENTITLEMENT_PRO] !== undefined;
    useSubscriptionStore.getState().setIsPro(isPro);
    return isPro;
  } catch {
    return false;
  } finally {
    useSubscriptionStore.getState().setLoading(false);
  }
}

export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}
