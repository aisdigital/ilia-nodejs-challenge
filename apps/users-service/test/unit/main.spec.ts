describe('Main', () => {
  it('should have correct module structure', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const appPath = path.resolve(__dirname, '../../src/app.module.ts');
    const appContent = fs.readFileSync(appPath, 'utf8');
    expect(appContent).toContain('@Module');
    expect(appContent).toContain('AppModule');
  });

  it('should have main file structure', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    expect(fs.existsSync(mainPath)).toBe(true);
  });

  it('should have NestFactory import', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('NestFactory');
  });

  it('should have bootstrap function in main', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('async function bootstrap');
    expect(mainContent).toContain('bootstrap()');
    expect(mainContent).toContain('NestFactory.create');
    expect(mainContent).toContain('app.listen');
  });

  it('should have port configuration', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('process.env.PORT');
    expect(mainContent).toContain('Number(process.env.PORT)');
  });

  it('should have app.listen call', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('await app.listen');
  });

  it('should have port variable assignment', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('const port');
  });

  it('should have port number conversion', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('Number(process.env.PORT)');
    expect(mainContent).toContain('const port = Number');
  });

  it('should have app.listen with port variable', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const mainPath = path.resolve(__dirname, '../../src/main.ts');
    const mainContent = fs.readFileSync(mainPath, 'utf8');
    expect(mainContent).toContain('await app.listen(port)');
  });
});
