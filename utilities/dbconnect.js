const { createConnection } = require("typeorm");
const connectDatabase = async ()=>{
      try{
            await createConnection(); // create connection
            console.log("Connected to database")
      }catch(e){
            console.error("Error in connecting db : "  , e);
      }
}

module.exports = {connectDatabase};