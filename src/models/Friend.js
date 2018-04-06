import config from '../config/models';

export default (Sequelize, DataTypes) => {
  const Friend = Sequelize.define('Friend',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    },
    {
      paranoid: config.paranoid
    }
  );

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
  };
  return Friend;
};
