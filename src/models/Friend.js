export default (Sequelize, DataTypes) => {
  var Friend = Sequelize.define('Friend',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      paranoid: true
    }
  )

  Friend.associate = (models) => {
    Friend.belongsTo(models.User, {
      as: 'sender',
      foreignKey: {
        name: 'senderId',
        allowNull: false
      }
    })

    Friend.belongsTo(models.User, {
      as: 'acceptor',
      foreignKey: {
        name: 'acceptorId',
        allowNull: false
      }
    })
  }
  return Friend
}
