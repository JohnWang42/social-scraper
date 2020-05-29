'use strict';
module.exports = (sequelize, DataTypes) => {
  const TwitterProfile = sequelize.define('TwitterProfile', {
    name: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('name');
        return rawValue ? rawValue : null;
      }
    },
    full_name: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('full_name');
        return rawValue ? rawValue : null;
      }
    },
    profile_pic: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('profile_pic');
        return rawValue ? rawValue : null;
      }
    },
    last_updated: {
      type: DataTypes.DATE,
      get() {
        const rawValue = this.getDataValue('last_updated');
        return rawValue ? Date.parse(rawValue) : null;
      }
    }
  }, {});
  TwitterProfile.associate = function(models) {
    // associations can be defined here
  };
  return TwitterProfile;
};