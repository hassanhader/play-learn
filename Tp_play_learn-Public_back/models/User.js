const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'This username is already taken'
      },
      validate: {
        notEmpty: { msg: 'Username cannot be empty' },
        len: {
          args: [3, 50],
          msg: 'Username must be between 3 and 50 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'This email is already registered'
      },
      validate: {
        notEmpty: { msg: 'Email cannot be empty' },
        isEmail: { msg: 'Please provide a valid email address' }
      }
    },
    password: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password cannot be empty' },
        len: {
          args: [6, 500],
          msg: 'Password must be at least 6 characters'
        }
      }
    },
    isGuest: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Admin users have access to admin dashboard and management features'
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10)
          user.password = await bcrypt.hash(user.password, salt)
        }
      }
    }
  })

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
  }

  User.prototype.toJSON = function() {
    const values = { ...this.get() }
    delete values.password
    return values
  }

  // Associations
  User.associate = (models) => {
    User.hasMany(models.Score, {
      foreignKey: 'userId',
      as: 'scores'
    })

    User.hasMany(models.Game, {
      foreignKey: 'createdBy',
      as: 'createdGames'
    })

    User.hasMany(models.UserProgress, {
      foreignKey: 'userId',
      as: 'progress'
    })
  }

  return User
}
