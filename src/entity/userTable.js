var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
   name: "user",
   tableName: "user",
   columns: {
      user_id: {
         type: "int",
         nullable: false,
         primary: true,
         generated: false,
      },
      profile_pic_url: {
         type: "varchar",
         length: 255,
         default:
            "https://res.cloudinary.com/dqpirrbuh/image/upload/v1700517682/blank-profile-picture_b84iuc.png",
      },
      email: {
         type: "varchar",
         length: 100,
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
      name: {
         type: "varchar",
         length: 255,
         nullable: false,
      },
      password: {
         type: "varchar",
         length: 255,
         nullable: true,
         default: null,
      },
   },
});
