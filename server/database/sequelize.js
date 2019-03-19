const Sequelize = require('sequelize')
const UserModel = require('../models/user')
const BlogModel = require('../models/blog')
const TagModel = require('../models/tag')


const RolesModel = require('../models/roles')
const User_OLD_Model = require('../models/users')
const Customer_Model = require('../models/customers')

const sequelize = new Sequelize('proba_orm', 'rootLetala', 'natalija21', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const User = UserModel(sequelize, Sequelize)
// BlogTag will be our way of tracking relationship between Blog and Tag models
// each Blog can have multiple tags and each Tag can have multiple blogs
const BlogTag = sequelize.define('blog_tag', {})
const Blog = BlogModel(sequelize, Sequelize)
const Tag = TagModel(sequelize, Sequelize)


const Roles = RolesModel(sequelize, Sequelize)
const User_OLD = User_OLD_Model(sequelize, Sequelize)
const Customer = Customer_Model(sequelize, Sequelize)

Blog.belongsToMany(Tag, { through: BlogTag, unique: false })
Tag.belongsToMany(Blog, { through: BlogTag, unique: false })
Blog.belongsTo(User);

Roles.belongsTo(User_OLD);

sequelize.sync({ force: false })
    .then(() => {
        console.log(`Database & tables created!`)
    })

module.exports = {
    User,
    Blog,
    Tag,


    Roles,
    User_OLD,
    Customer
}