module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('product', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      category_id : {
        type : DataTypes.UUID
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
    product.associate = function (models) {
      product.belongsTo(models.category, {
        as : 'product_name',
        foreignKey : 'category_id'
      })
    }
  
    return product;
  };