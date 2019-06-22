module.exports = {
  up: (queryInterface, DataTypes) => {
    const NOW = queryInterface.sequelize.literal('NOW()')
    return queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        description: 'User unique identification (PK)'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        description: 'User unique identification (PK)'
      },
      email: {
        type: DataTypes.STRING,
        unique: 'users_enterprise_email_unique_idx',
        description: 'User\'s email (unique by enterprise)'
      },
      last_login_at: {
        type: DataTypes.DATE,
        description: 'User\'s last login'
      },
      reset_password_token: {
        type: DataTypes.STRING(512),
        description: 'User\'s reset token to be validated'
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
      },
      password: {
        type: DataTypes.STRING,
        description: 'User\'s password'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('users', { transaction: t })
    })
  }
}
