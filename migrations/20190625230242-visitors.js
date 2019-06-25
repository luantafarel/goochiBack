module.exports = {
  up: (queryInterface, DataTypes) => {
    const NOW = queryInterface.sequelize.literal('NOW()')
    return queryInterface.createTable('visitors', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        description: 'Visitors unique identification (PK)'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        description: 'User unique identification (FK)'
      },
      world_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'worlds',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        description: 'World unique identification (FK)'
      },
      last_login_at: {
        type: DataTypes.DATE,
        description: 'User\'s last login'
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: NOW,
        description: 'Record was created at this date'
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: NOW,
        description: 'Record was updated at this date'
      },
      deleted_at: {
        type: DataTypes.DATE,
        description: 'Record deleted at'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('visitors', { transaction: t })
    })
  }
}
