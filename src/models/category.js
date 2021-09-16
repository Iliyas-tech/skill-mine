module.exports = (sequelize, DataTypes) => {
    const category = sequelize.define('category', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      parent_id :{
        type: DataTypes.UUID,
      },
      is_voided: {
        type : DataTypes.BOOLEAN
      },
      is_enabled: {
        type : DataTypes.BOOLEAN
      }
    }, {
      freezeTableName: true,
    });
    category.associate = function (models) {
      category.belongsTo(models.category, {
        as : 'parent',
        foreignKey :"parent_id",
        targetId : 'id'
      })
      category.hasMany(models.category, {
        as : 'subcategories',
        foreignKey :"parent_id",
      }),
      category.hasMany(models.product, {
        as :'product_info',
        foreignKey :"category_id"
      })
    }
  
    return category;
  };