const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const typeorm = require("typeorm");
const productCategoriesTable = require("../src/entity/productCategoriesTable");
const jwt = require("jsonwebtoken");

const getUserIdFromToken = (token) => {
      var decoded = jwt.verify(token, "shhhhh");
      return decoded.user_id;
   };

router.post('/create_category', async function(req, res){
      var user_id = null;
      try {
        user_id = getUserIdFromToken(
          req.headers["authorization"].replace("Bearer ", "")
        );
      } catch (err) {
        //if token is malformed or expired then send response as 401
        console.error(err)
        return res.status(401).json({
          ok: false,
          msg: "Token is malformed or expired",
        });
      }
      try{
            const {name} = req.body;
            if(!name){
                  return res.status(400).json({ error: "Name is required" });
            }
            const categoryRepository = typeorm.getRepository(productCategoriesTable);
            const existingCategory = await categoryRepository.findOne({
               where : {name : name},
            });
            if(existingCategory){
                  return res.status(400).json({error: "Category with this name already exists" });
            }
            const newCategory = categoryRepository.create({
               name : name,
            });
            categoryRepository.save(newCategory);
            return res.status(200).json({ok : true, msg: "Category with this name created" , data : newCategory});
      }catch(err){
            return res.status(500).json({ok : false , msg : "internal server error"});
      }
});

router.get('/get_all_categories', async(req, res) => {
      var user_id = null;
      try {
        user_id = getUserIdFromToken(
          req.headers["authorization"].replace("Bearer ", "")
        );
      } catch (err) {
        //if token is malformed or expired then send response as 401
        console.error(err)
        return res.status(401).json({
          ok: false,
          msg: "Token is malformed or expired",
        });
      }
      try{
            const categories =  await typeorm.createQueryBuilder("product_category")
            .select(["product_category.category_id", "product_category.name"])
            .getMany();
            return res.status(200).json({ok : true, data : categories});
      } catch(err){
            return res.status(500).json({ok : false , msg : "internal server error"});
      }
})


router.post('/delete_category' , async (req , res) => {
      var user_id = null;
      try {
        user_id = getUserIdFromToken(
          req.headers["authorization"].replace("Bearer ", "")
        );
      } catch (err) {
        //if token is malformed or expired then send response as 401
        console.error(err)
        return res.status(401).json({
          ok: false,
          msg: "Token is malformed or expired",
        });
      }
      try{
            const {category_id} = req.body;
            if(!category_id){
                  return res.status(400).json({ error: "Category id is required" });
            }
            const categoryRepository = typeorm.getRepository(productCategoriesTable);
            const existingCategory = await categoryRepository.findOne({
               where : {category_id : category_id},
            });
            if(!existingCategory){
                  return res.status(400).json({error: "Category with this id does not exist" });
            }
            await categoryRepository.delete(existingCategory.category_id);
            return res.status(201).json({ok : true, msg: "Category with this id deleted"});
      }catch(err){
            console.log(err);
            return res.status(500).json({ok : false , msg : "Internal Server error"});
      }
})

router.post('/update_category', async (req, res) => {
      var user_id = null;
      try {
        user_id = getUserIdFromToken(
          req.headers["authorization"].replace("Bearer ", "")
        );
      } catch (err) {
        //if token is malformed or expired then send response as 401
        console.error(err)
        return res.status(401).json({
          ok: false,
          msg: "Token is malformed or expired",
        });
      }
      try{
            const {category , category_id} = req.body;
            if(!category_id || !category){
                  return res.status(400).json({ error: "Category id and name is required" });
            }
            const categoryRepository = typeorm.getRepository(productCategoriesTable);
            const existingCategory = await categoryRepository.findOne({
                  where : {category_id : category_id}
            });
            if(!existingCategory){
                  return res.status(400).json({error: "Category with this id does not exist" });
            }
            await categoryRepository.save({
                  category_id : existingCategory.category_id,
                  name : category,
            });
            return res.status(201).json({ok : true, msg: "Category with this id updated"});
      }catch(err){
            console.log(err);
            return res.status(500).json({ok : false, msg : "Internal Server error"});
      }
})

module.exports = router;