

export const environment: any = {
    production: true,
    apiCode:"media",
    bddConfig: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'noyeau_medias',
        entities: ["dist/**/*.entity{.ts,.js}"],
        synchronize: true,
    },
    apiSystem:'http://192.168.1.15:1899',
    apiKeyCode:'appNoyeau',
};