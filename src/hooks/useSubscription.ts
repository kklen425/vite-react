import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { refreshProStatus } from '../services/purchaseService';
import { useEffect } from 'react';

export function useSubscription() {
  const isPro      = useSubscriptionStore(s => s.isPro);
  const isLoading  = useSubscriptionStore(s => s.isLoading);
  const setIsPro   = useSubscriptionStore(s => s.setIsPro);

  useEffect(() => {
    refreshProStatus();
  }, []);

  return { isPro, isLoading, setIsPro };
}
