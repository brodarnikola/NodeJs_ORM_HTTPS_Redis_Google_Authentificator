module.exports = (sequelize, type) => {
    return sequelize.define('customers', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        //flag: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        name: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        },
        address: {
            type: type.STRING,
            allowNull: false,
            defaultValue: true
        }
        // PRIMJER SAMO 1 REDKA
        //address: type.STRING
    })
}


/* CREATE TABLE `customers` (
    `id` int(20) NOT NULL,
    `name` varchar(30) NOT NULL,
    `address` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8; */