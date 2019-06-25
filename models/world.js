module.exports = (sequelize, DataTypes) => {
  let World = sequelize.define('World', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      description: 'World unique identification (PK)'
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
    sky: {
      type: DataTypes.STRING,
      allowNull: false,
      description: 'String representation of the worlds sky color'
    },
    ground: {
      type: DataTypes.STRING,
      allowNull: false,
      description: 'Text representation of the worlds ground color'
    },
    plate: {
      type: DataTypes.STRING,
      allowNull: false,
      description: 'Text of the worlds plate'
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
    },
    unique_visitors: {
      type: DataTypes.INTEGER,
      description: 'Unique visitors count'
    }
  }, { tableName: 'users' })
  if (typeof World === 'undefined') return
  return World
}
