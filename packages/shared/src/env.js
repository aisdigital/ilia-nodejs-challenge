export function mustGetEnv(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}
