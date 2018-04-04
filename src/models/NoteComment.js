import config from '../config/models';

export default (Sequelize, DataTypes) => {
  var NoteComment = Sequelize.define('NoteComment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      paranoid: config.paranoid
    }
  );

  NoteComment.associate = (models) => {
    NoteComment.belongsTo(models.User, {
      as: 'owner',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    });

    NoteComment.belongsTo(models.Note, {
      as: 'note',
      foreignKey: {
        name: 'noteId',
        allowNull: false
      }
    });
  };
  return NoteComment;
};
