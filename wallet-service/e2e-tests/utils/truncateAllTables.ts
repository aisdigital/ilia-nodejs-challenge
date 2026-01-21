type TruncatePrismaClient = {
  $queryRaw<T = unknown>(
    query: TemplateStringsArray,
    ...values: any[]
  ): Promise<T>;

  $executeRawUnsafe(query: string): Promise<unknown>;
};

export async function truncateAllTables(
  prisma: TruncatePrismaClient,
  schemas: string[],
) {
  const tables = await Promise.all(
    schemas.map(async (schema) => {
      const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = ${schema}
      `;

      return result
        .filter(({ tablename }) => tablename !== '_prisma_migrations')
        .map(({ tablename }) => `"${schema}"."${tablename}"`);
    }),
  );

  const tableNames = tables.flat().join(', ');

  if (!tableNames) return;

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} CASCADE;`);
}
