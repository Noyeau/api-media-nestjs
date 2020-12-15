

export const environment: any = {
    production: false,
    apiCode:"medias",
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
    apiSystem:'http://localhost:1899',
    apiKeyCode:'appNoyeau',
};