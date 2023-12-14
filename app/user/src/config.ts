function assertEnvVarPresent(
  value: string | undefined,
  envName: string
): string {
  if (value == null) {
    throw new Error(
      `Required environment variable missing on init: ${envName}`
    );
  }
  return value.toString();
}

export const PORT = process.env.PORT;
export const HOST = assertEnvVarPresent(process.env.HOST, 'HOST').endsWith('/')
  ? process.env.HOST!.slice(0, -1)
  : process.env.HOST!;
export const JWT_SECRET = assertEnvVarPresent(
  process.env.JWT_SECRET,
  'JWT_SECRET'
);

export const JWT_SECRET_INTERNAL = assertEnvVarPresent(
  process.env.JWT_SECRET_INTERNAL,
  'JWT_SECRET_INTERNAL'
);
