module.exports = (sequelize, DataTypes) => {
  let Visitor = sequelize.define('Visitor', {
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
      description: 'Record was created at this date'
    },
    updated_at: {
      type: DataTypes.DATE,
      description: 'Record was updated at this date'
    },
    deleted_at: {
      type: DataTypes.DATE,
      description: 'Record deleted at'
    }
  }, { tableName: 'visitors' })
  if (typeof Visitor === 'undefined') return
  return Visitor
}
