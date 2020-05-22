'use strict';
module.exports = (sequelize, DataTypes) => {
  const InstagramEntry = sequelize.define('InstagramEntry', {
    url_code: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('url_code');
        return rawValue ? rawValue : null;
      }
    },
    img_src: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('img_src');
        return rawValue ? rawValue : null;
      }
    },
    account_name:{
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('account_name');
        return rawValue ? rawValue : null;
      }
    },
  }, {});
  InstagramEntry.associate = function(models) {
    // associations can be defined here
  };
  return InstagramEntry;
};