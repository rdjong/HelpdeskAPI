module.exports = function()
{
    return {
        database: "mongodb://",
        basicAuth: {
            username: "admin",
            password: "JH(5t7ywq4ufh974H$(U)t84w"
        },
        whitelist: [
            'http://localhost:3000',
            'http://localhost:8080' ,
        ]
    }
};
