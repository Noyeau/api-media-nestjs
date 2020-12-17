

export const environment: any = {
    production: true,
    apiCode: "media",
    bddConfig: {
        type: (process.env.dbType || 'mysql') as any,
        host: process.env.dbHost || 'localhost',
        port: +process.env.dbPort || 3306,
        username: process.env.dbUsername || 'root',
        password: process.env.dbPassword || '',
        database: process.env.dbDatabase || 'noyeau_media',
        entities: [process.env.dbEntities || "/**/*.entity{.ts,.js}"],
        synchronize: (process.env.dbSynchronize == 'true' ? true : false) || false
    },
    apiSystem: process.env.apiSystem || 'http://localhost:1899',
    apiKeyCode: process.env.apiKeyCode || 'apiKeyCode',
};