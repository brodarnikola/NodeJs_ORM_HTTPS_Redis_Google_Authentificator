module.exports = (sequelize, type) => {
    return sequelize.define('users', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        //flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        email: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        name: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        password: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        username: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        enabled: {
            type: type.INTEGER,
            allowNull: false,
            defaultValue: true
        },
        secret_key: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        enabledQR: {
            type: type.INTEGER,
            allowNull: false,
            defaultValue: true
        }
        // PRIMJER SAMO 1 REDKA
        //address: type.STRING
    })
}





/* CREATE TABLE `users` (
    `id` bigint(20) NOT NULL,
    `email` varchar(40) NOT NULL,
    `name` varchar(40) NOT NULL,
    `password` varchar(100) NOT NULL,
    `username` varchar(20) NOT NULL,
    `enabled` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8; */
