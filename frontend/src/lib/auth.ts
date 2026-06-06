const KEY = "ac_access_code";

export function getAccessCode(): string {
  return localStorage.getItem(KEY) ?? "";
}

export function setAccessCode(code: string): void {
  localStorage.setItem(KEY, code.trim());
}

export function clearAccessCode(): void {
  localStorage.removeItem(KEY);
}

export function hasAccessCode(): boolean {
  return getAccessCode().length > 0;
}

// Header für mutierende Requests (Upload, Transcribe, Render, Delete)
export function authHeaders(): Record<string, string> {
  const code = getAccessCode();
  return code ? { "X-Access-Code": code } : {};
}

// Bei 401 (falscher Code): Code verwerfen und Gate erneut zeigen
export function handleUnauthorized(): void {
  clearAccessCode();
  window.location.reload();
}
