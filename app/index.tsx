import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate immediately to splash screen on app start
    router.replace('/splash');
  }, [router]);

  // Return null or a minimal loading indicator since we navigate immediately
  return null;
}
