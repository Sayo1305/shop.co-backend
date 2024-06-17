const productTable = require("./productTable");
const variationOptionTable = require("./variationOptionTable");

var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
      name: "product_config",
      tableName: "product_config",
      columns: {
        product_config_id : {
          primary : true,
          type: "int",
          nullable : false,
          generated : true,
        },
        product_id: {
          type: "int",
          nullable: false,
        },
        variation_option_id: {
          type: "int",
          nullable: false,
        },
      },
      relations : {
        productTable : {
           type : "many-to-one",
           target : productTable,
           joinColumn : {
              name : "product_id",
              referencedColumnName : "product_id"
           },
           onDelete: "CASCADE",
           onUpdate: "CASCADE",
        },
        variationOptionTable : {
          type : "many-to-one",
          target : variationOptionTable,
          joinColumn : {
            name : "variation_option_id",
            referencedColumnName : "variation_option_id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }
      }
    });
    