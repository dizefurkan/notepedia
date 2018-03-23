export default (Sequelize, DataTypes) => {
    var Note = Sequelize.define('Note',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            content: {
                type: DataTypes.STRING
            }
        },
        {
            paranoid: true
        }
    );

    Note.associate = (models) => {
        Note.belongsTo(models.User, {
            as: 'owner',
            foreignKey: {
                name: 'userId',
                allowNull: false
            }
        });

        Note.hasMany(models.NoteComment, {
            as: 'noteComment',
            foreignKey: 'noteId',
            sourceKey: 'id'
        });

        Note.hasMany(models.SharedNote, {
            as: 'sharedNote',
            foreignKey: 'noteId',
            sourceKey: 'id'
        });

        Note.hasMany(models.PublishedNote, {
            as: 'publishedNote',
            foreignKey: 'noteId',
            sourceKey: 'id'
        });
    }
    return Note;
};