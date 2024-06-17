var express = require("express");
var router = express.Router();
var typeorm = require("typeorm");
const ormconfig = require("../ormconfig");
const userRouter = require('./user');
const productRouter = require('./product');
const categoryRouter = require('./category');
const variationRouter = require('./variation');
typeorm
   .createConnection(ormconfig)
   .then(async (connection) => {
      console.log("Connected to database");
      router.use('/api/user' , userRouter);
      router.use('/api/product', productRouter);
      router.use('/api/category', categoryRouter);
      router.use('/api/variation', variationRouter);
   
   })
   .catch((err) => {
      console.log("error in connection connection: ", err);
   });
module.exports = router;
