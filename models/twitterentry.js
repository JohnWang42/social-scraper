'use strict';
module.exports = (sequelize, DataTypes) => {
  const TwitterEntry = sequelize.define('TwitterEntry', {
    id_str: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('profile_slug');
        return rawValue ? rawValue : null;
      }
    },
    html: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('html');
        return rawValue ? rawValue : null;
      }
    },
    account_name: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('account_name');
        return rawValue ? rawValue : null;
      }
    }
  }, {});
  TwitterEntry.associate = function(models) {
    // associations can be defined here
  };
  return TwitterEntry;
};