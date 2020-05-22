'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstagramProfile = sequelize.define('InstagramProfile', {
    profile_slug: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('profile_slug');
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
  InstagramProfile.associate = function(models) {
    // associations can be defined here
  };
  return InstagramProfile;
};