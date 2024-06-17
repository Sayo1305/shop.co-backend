const productCategoriesTable = require("./productCategoriesTable");
var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
   name: "product",
   tableName: "product",
   columns: {
      product_id: {
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
      description: {
         type: "text",
         nullable: true,
      },
      quantity : {
         type : "int",
         nullable: false,
         default : 10,
      },
      ratings : {
         type : "int",
         nullable : false,
         default : 0,
      },
      image_url: {
         type: "varchar", // Assuming storing image URLs as strings
         array: true, // Indicates this column contains an array of values
         nullable: true,
      }, 
      header_image_url : {
         type: "varchar", 
         nullable: true,
      },
      category_id: {
         type: "int",
         nullable: true,
      },
      price : {
         type : "int",
         nullable : false,
         default : 1000,
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
