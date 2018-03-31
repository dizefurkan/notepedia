export default (Sequelize, DataTypes) => {
  var User = Sequelize.define('User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      surname: {
        type: DataTypes.STRING,
        allowNull: false
      },
      verifyCode: {
        type: DataTypes.STRING
      },
      isApproved: {
        type: DataTypes.BOOLEAN
      }
    },
    {
      paranoid: true
    }
  )

  User.associate = (models) => {
    User.hasMany(models.Note, {
      as: 'note',
      foreignKey: 'userId',
      sourceKey: 'id'
    })

    User.hasMany(models.NoteComment, {
      as: 'noteComment',
      foreignKey: 'userId',
      sourceKey: 'id'
    })

    User.hasMany(models.SharedNote, {
      as: 'sharedNote',
      foreignKey: 'userId',
      sourceKey: 'id'
    })

    User.hasMany(models.PublishedNote, {
      as: 'publishedNote',
      foreignKey: 'userId',
      sourceKey: 'id'
    })

    User.hasMany(models.PublishedNoteComment, {
      as: 'publishedNoteComment',
      foreignKey: 'userId',
      sourceKey: 'id'
    })

    User.hasMany(models.Friend, {
      as: 'friendSender',
      foreignKey: 'senderId',
      sourceKey: 'id'
    })

    User.hasMany(models.Friend, {
      as: 'friendAcceptor',
      foreignKey: 'acceptorId',
      sourceKey: 'id'
    })

    User.hasMany(models.FriendsRequest, {
      as: 'friendRequestSource',
      foreignKey: 'sourceId',
      sourceKey: 'id'
    })

    User.hasMany(models.FriendsRequest, {
      as: 'friendRequestTarget',
      foreignKey: 'targetId',
      sourceKey: 'id'
    })
  }

  return User
}
