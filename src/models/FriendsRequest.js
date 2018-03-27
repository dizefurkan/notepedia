export default (Sequelize, DataTypes) => {
    var FriendsRequest = Sequelize.define('FriendsRequest',
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

    FriendsRequest.associate = (models) => {
        FriendsRequest.belongsTo(models.User, {
            as: 'source',
            foreignKey: {
                name: 'sourceId',
                allowNull: false
            }
        });

        FriendsRequest.belongsTo(models.User, {
            as: 'target',
            foreignKey: {
                name: 'targetId',
                allowNull: false
            }
        });
    }
    return FriendsRequest;
};