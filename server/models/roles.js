module.exports = (sequelize, type) => {
    return sequelize.define('roles_users', {
        user_id: {
            primaryKey: true,
            autoIncrement: true,
            type: type.INTEGER
        },
        role_name: {
            type: type.STRING,
            allowNull: false
        }
    })
}

