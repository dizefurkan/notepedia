import config from '../config/models';

export default (Sequelize, DataTypes) => {
  const SharedNote = Sequelize.define('SharedNote',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      canBeEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      canBeDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    },
    {
      paranoid: config.paranoid
    }
  );

  SharedNote.associate = (models) => {
    SharedNote.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });

    SharedNote.belongsTo(models.Note, {
      as: 'note',
      foreignKey: {
        name: 'noteId',
        allowNull: false
      }
    });
  };
  return SharedNote;
}
