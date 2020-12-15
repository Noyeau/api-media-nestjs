

export const environment: any = {
    production: true,
    apiCode:"media",
    bddConfig: {
        type: 'mysql',
        host: '192.168.1.15',
        port: 3306,
        username: 'root',
        password: 'NoyeauP@ssword',
        database: 'noyeau_media',
        entities: ["dist/**/*.entity{.ts,.js}"],
        synchronize: true,
    },
    apiSystem:'http://192.168.1.15:1899',
    apiKeyCode:'appNoyeau',
};