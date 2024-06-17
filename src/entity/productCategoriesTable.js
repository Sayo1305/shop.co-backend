var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
      name: "product_category",
      tableName: "product_category",
      columns: {
        category_id: {
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
    });
    