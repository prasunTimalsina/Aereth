export function parsePort(rawValue: string | undefined, fallback: number): number {
  if (rawValue === undefined || rawValue.trim() === "") {
    return fallback;
  }

  const port = Number(rawValue);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port value: ${rawValue}`);
  }

  return port;
}

