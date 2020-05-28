const config = {
    updateInterval: 15, // 15 minutes (will be converted to milliseconds in app)
    corslist: [],
};

config.twitter = {
    consumer_key: "consumer_key",
    consumer_secret: "consumer_secret",
    access_token_key: "access_token_key",
    access_token_secret: "access_token_secret",
};

config.development = {
    username: 'social_feed',
    password: 'social_feed',
    database: 'social_feed',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    domain: 'localhost:3000',
};
config.test = {
    username: 'social_feed',
    password: 'social_feed',
    database: 'social_feed',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    domain: 'localhost:3000',
};
config.production = {
    username: 'social_feed',
    password: 'social_feed',
    database: 'social_feed',
    host: '127.0.0.1',
    port: 3306,
    dialect: 'mysql',
    domain: 'localhost:3000',
};

module.exports = config;