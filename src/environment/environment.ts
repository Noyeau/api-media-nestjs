

export const environment: any = {
    production: true,
    apiCode: "media",
    bddConfig: {
        type: (process.env.dbType || 'mysql') as any,
        host: process.env.dbHost || 'localhost',
        port: +process.env.dbPort || 3306,
        username: process.env.dbUsername || 'root',
        password: process.env.dbPassword || '',
        database: process.env.dbDatabase || 'noyeau_medias',
        entities: [process.env.dbEntities || "dist/**/*.entity{.ts,.js}"],
        synchronize: (process.env.dbSynchronize == 'true' ? true : false) || true
    },
    apiSystem: process.env.apiSystem || 'http://192.168.1.15:1899',
    apiKeyCode: process.env.apiKeyCode || 'appNoyeau',
    tokenSecret: process.env.tokenSecret || "monSecretTokenMedia",
    tokenTime: process.env.tokenTime || 3000
};