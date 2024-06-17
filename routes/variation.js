const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const typeorm = require("typeorm");
const productCategoriesTable = require("../src/entity/productCategoriesTable");
const jwt = require("jsonwebtoken");
const variationTable = require("../src/entity/variationTable");
const variationOptionTable = require("../src/entity/variationOptionTable");

const getUserIdFromToken = (token) => {
   var decoded = jwt.verify(token, "shhhhh");
   return decoded.user_id;
};

router.post("/create_varriation", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }
   const { category_id, name } = req.body;
   try {
      if (!category_id || !name) {
         return res.status(400).json({ error: "Category id and name is required" });
      }
      const categoryRepository = typeorm.getRepository(productCategoriesTable);
      const existingCategory = await categoryRepository.findOne({
         where: { category_id: category_id },
      });
      if (!existingCategory) {
         return res.status(400).json({ error: "Category with this id does not exist" });
      }
      const VarriationRepository = typeorm.getRepository(variationTable);
      const newVariation =  VarriationRepository.create({
         name: name,
         category_id: existingCategory.category_id,
     });
     
     // Save the new variation
     await VarriationRepository.save(newVariation);

     // Return the newly created variation in the response
     return res.status(201).json({ ok: true, variation: newVariation });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.post("/delete_variation", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   const { variationId } = req.body;

   try {
      const variationRepository = typeorm.getRepository(variationTable);
      const existingVariation = await variationRepository.findOne({
         where: { variation_id: variationId },
      });

      if (!existingVariation) {
         return res.status(404).json({ error: "Variation with this id does not exist" });
      }
      await variationRepository.delete(existingVariation.variation_id);

      return res.status(201).json({ ok: true, msg: "Variation deleted successfully" });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.post("/update_variation", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   const { variation_id, name } = req.body;

   try {
      const variationRepository = typeorm.getRepository(variationTable);
      const existingVariation = await variationRepository.findOne({
         where: { id: variation_id },
      });

      if (!existingVariation) {
         return res.status(404).json({ error: "Variation with this id does not exist" });
      }

      existingVariation.name = name; // Updating the name

      await variationRepository.save(existingVariation);

      return res.status(200).json({ ok: true, variation: existingVariation });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.get("/get_variations", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   try {
      const variationRepository = typeorm.getRepository(variationTable);
      const variations = await variationRepository.find(); // Fetch all variations

      return res.status(200).json({ ok: true, variations: variations });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});


router.post('/get_variation_by_category', async (req , res) => { 
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }
   const { category_id } = req.body;
   try{
      if(!category_id) return res.status(404).json({ok : false, msg: "Body is empty"});
      const variationRepository = typeorm.getRepository(variationTable);

      const variations = await variationRepository.find({
         where: { category_id: category_id },
      }); 
      if(!variations) return res.status(404).json({ok : false, msg: "Variations not found"});
      return res.status(200).json({ok : true, variations: variations});
   }catch(err){
      console.error(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
})

router.post("/create_varriation_option", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }
   const { name, varriation_id } = req.body;
   try {
      if (!name || !varriation_id) {
         return res.status(400).json({ error: "Name and varriation id is required" });
      }
      const variationRepository = typeorm.getRepository(variationTable);
      const varriationOptionRepository = typeorm.getRepository(variationOptionTable);
      const existingVariation = await variationRepository.findOne({
         where: { variation_id: varriation_id },
      });
      if (!existingVariation) {
         return res.status(400).json({ error: "Variation with this id does not exist" });
      }
      const newVarriationOption = varriationOptionRepository.create({
         name: name,
         variation_id: varriation_id,
      });
      await varriationOptionRepository.save(newVarriationOption);

      return res.status(201).json({ ok: true, varriation_option: newVarriationOption });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.post("/update_variation_option", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   const { variation_option_id, name } = req.body;

   try {
      const variationOptionRepository = typeorm.getRepository(variationOptionTable);
      const existingVariationOption = await variationOptionRepository.findOne({
         where: { id: variation_option_id },
      });

      if (!existingVariationOption) {
         return res.status(404).json({ error: "Variation option with this id does not exist" });
      }

      existingVariationOption.name = name; // Updating the name

      await variationOptionRepository.save(existingVariationOption);

      return res.status(200).json({ ok: true, variation_option: existingVariationOption });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.post("/delete_variation_option", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   const { variation_option_id } = req.body;

   try {
      const variationOptionRepository = typeorm.getRepository(variationOptionTable);
      const existingVariationOption = await variationOptionRepository.findOne({
         where: { id: variation_option_id },
      });

      if (!existingVariationOption) {
         return res.status(404).json({ error: "Variation option with this id does not exist" });
      }

      await variationOptionRepository.delete(existingVariationOption);

      return res.status(200).json({ ok: true, msg: "Variation option deleted successfully" });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});

router.get("/get_variation_options", async (req, res) => {
   const { variation_id } = req.query;
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      //if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   try {
      const variationOptionRepository = typeorm.getRepository(variationOptionTable);
      const variationOptions = await variationOptionRepository.find({
         where: { variation_id: variation_id },
      });

      return res.status(200).json({ ok: true, variation_options: variationOptions });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ ok: false, msg: "Internal Server error" });
   }
});


module.exports = router ;
