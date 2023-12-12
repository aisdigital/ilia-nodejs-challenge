function assertEnvVarPresent(
  value: string | undefined,
  envName: string
): string {
  if (value == null) {
    console.log('env:', process.env.NODE_ENV);
    throw new Error(
      `Required environment variable missing on init: ${envName}`
    );
  }
  return value.toString();
}

export const PORT = process.env.PORT ?? 3010;
export const HOST = assertEnvVarPresent(process.env.HOST, 'HOST').endsWith('/')
  ? process.env.HOST!.slice(0, -1)
  : process.env.HOST!;
