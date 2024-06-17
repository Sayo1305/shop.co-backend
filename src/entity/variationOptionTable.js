const variationTable = require("./variationTable");

var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
      name: "variation_option",
      tableName: "variation_option",
      columns: {
        variation_option_id: {
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
        variation_id : {
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
        variationTable : {
          type : "many-to-one",
          target : variationTable,
          joinColumn : {
            name : "variation_id",
            referencedColumnName : "variation_id"
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        }
      }
    });
    