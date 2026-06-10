import { useAuthStore } from '../store/authStore';

// Returns true if an optional extension is enabled for the company.
// useFeature('AI_ASSISTANT') -> true/false
export function useFeature(key) {
  const user = useAuthStore((s) => s.user);
  const features = user?.company?.features || [];
  return !!features.find((f) => f.key === key && f.enabled);
}
