import { Redirect } from 'expo-router';
import { useTaskStore } from '@/store/taskStore';

export default function Index() {
  const isAuthenticated = useTaskStore((state) => state.isAuthenticated);
  
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
