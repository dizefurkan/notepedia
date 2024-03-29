import config from '../config/models';

export default (Sequelize, DataTypes) => {
  const PublishedNoteComment = Sequelize.define('PublishedNoteComment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      paranoid: config.paranoid
    }
  );

  PublishedNoteComment.associate = (models) => {
    PublishedNoteComment.belongsTo(models.PublishedNote, {
      as: 'published',
      foreignKey: {
        name: 'publishedId',
        allowNull: false
      }
    })

    PublishedNoteComment.belongsTo(models.User, {
      as: 'owner',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    })
  };
  return PublishedNoteComment;
};
