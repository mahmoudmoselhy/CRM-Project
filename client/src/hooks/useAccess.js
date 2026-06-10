import { useAuthStore } from '../store/authStore';

const FIELD = {
  view: 'canView',
  create: 'canCreate',
  edit: 'canEdit',
  delete: 'canDelete',
};

// Shared access hook. can('LEADS', 'edit') -> true/false.
// ADMIN always returns true; other users are checked against their permissions.
export function useAccess() {
  const user = useAuthStore((s) => s.user);

  const can = (module, action) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const perm = (user.permissions || []).find((p) => p.module === module);
    return !!(perm && perm[FIELD[action]]);
  };

  return { can, role: user?.role };
}
