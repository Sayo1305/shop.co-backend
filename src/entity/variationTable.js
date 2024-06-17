const productCategoriesTable = require("./productCategoriesTable");

var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
      name: "variation",
      tableName: "variation",
      columns: {
        variation_id: {
          type: "int",
          nullable: false,
          primary: true,
          generated: true,
        },
        name: {
          type: "varchar",
          length: 255,
          nullable: false,
        },
        category_id : {
          type: "int",
          nullable : false,
        },
        created_at: {
          type: "timestamp",
          default: () => "CURRENT_TIMESTAMP",
          nullable: false,
        },
        updated_at: {
          type: "timestamp",
          default: () => "CURRENT_TIMESTAMP",
          nullable: false,
        },
      },
      relations : {
        productCategoriesTable : {
          type : "many-to-one",
          target : productCategoriesTable,
          joinColumn : {
            name : "category_id",
            referencedColumnName : "category_id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }
      }
    });
    