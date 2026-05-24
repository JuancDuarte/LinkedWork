import { environment } from '../../environments/environment';

/** URL absoluta de foto de perfil (backend, filename o fallback Dicebear). */
export function profilePhotoUrl(
  foto: string | null | undefined,
  seed: string | null | undefined
): string {

  if (foto && foto.trim()) {
    return foto;
  }

  const s = (seed || 'user').trim() || 'user';

  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s)}`;
}