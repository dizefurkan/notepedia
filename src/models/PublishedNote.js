export default (Sequelize, DataTypes) => {
  var PublishedNote = Sequelize.define('PublishedNote',
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

  PublishedNote.associate = (models) => {
    PublishedNote.belongsTo(models.User, {
      as: 'owner',
      foreignKey: {
        name: 'userId',
        allowNull: false
      }
    })

    PublishedNote.belongsTo(models.Note, {
      as: 'note',
      foreignKey: {
        name: 'noteId',
        allowNull: false
      }
    })
  }
  return PublishedNote
}
