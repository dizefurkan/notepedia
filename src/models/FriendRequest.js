export default (Sequelize, DataTypes) => {
    var FriendRequest = Sequelize.define('FriendRequest',
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
    );

    FriendRequest.associate = (models) => {
        FriendRequest.belongsTo(models.User, {
            as: 'source',
            foreignKey: {
                name: 'sourceId',
                allowNull: false
            }
        });

        FriendRequest.belongsTo(models.User, {
            as: 'target',
            foreignKey: {
                name: 'targetId',
                allowNull: false
            }
        });
    }
    return FriendRequest;
};