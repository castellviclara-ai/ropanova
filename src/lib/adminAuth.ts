const KEY = "rn_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}
export function setAdminToken(t: string) {
  localStorage.setItem(KEY, t);
}
export function clearAdminToken() {
  localStorage.removeItem(KEY);
}
