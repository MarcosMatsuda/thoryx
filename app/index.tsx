import { useRootNavigationState, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function IndexScreen() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return; // wait for navigator ready
    router.replace('/splash');
  }, [rootNavigationState?.key]);

  return null; // or loading indicator
}
