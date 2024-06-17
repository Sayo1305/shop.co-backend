/** @format */
const express = require("express");
const rateLimit = require("express-rate-limit");
const { decode } = require("base64-arraybuffer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const productTable = require("../src/entity/productTable");
const typeorm = require("typeorm");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const upload_image = require("../utilities/upload_image");
const productCategoriesTable = require("../src/entity/productCategoriesTable");
const delete_images = require("../utilities/delete_image");
const variationOptionTable = require("../src/entity/variationOptionTable");
const productConfigTable = require("../src/entity/productConfigTable");
const getUserIdFromToken = (token) => {
   var decoded = jwt.verify(token, "shhhhh");
   return decoded.user_id;
};

const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Multer configuration
const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, "uploads/");
   },
   filename: function (req, file, cb) {
      cb(null, file.originalname);
   },
});

const upload = multer({ storage: storage });

const uploadFolder = path.join(__dirname, "..", "uploads");

function extractFileName(url) {
   const parts = url.split("/");
   return parts[parts.length - 1];
}

const deleteImagesAsync = async (image_names) => {
   const deletePromises = image_names.map(async (image) => {
      const image_url = extractFileName(image);
      return await delete_images(image_url);
   });

   // Wait for all delete promises to resolve
   await Promise.all(deletePromises);
};

router.post("/create_product", upload.array("files"), async function (req, res) {
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
      const categoryRepository = typeorm.getRepository(productCategoriesTable);
      const existingCategory = await categoryRepository.findOne({
         where: { category_id: parseInt(req.body.category_id, 10) },
      });
      if (!existingCategory) {
         return res.status(400).json({ error: "Category with this id does not exist" });
      }
      const image_names = await upload_image();
      const product_table = await typeorm.getRepository(productTable);
      const new_product = await product_table.create({
         name: req.body.name,
         description: req.body.product_description,
         price: parseInt(req.body.price, 10),
         category_id: existingCategory.category_id,
         image_url: image_names,
         quantity: req.body.quantity,
      });
      await product_table.save(new_product);

      return res.status(200).json({ ok: true, data: new_product });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, msg: "internal server error" });
   }
});

router.get("/products", async function (req, res) {
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
      const productRepository = typeorm.getRepository(productTable);
      const products = await productRepository.find();
      return res.status(200).json({ ok: true, data: products });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, msg: "internal server error" });
   }
});

router.get("/product/:id", async function (req, res) {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      // if token is malformed or expired then send response as 401
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }

   const productId = parseInt(req.params.id, 10);
   if (isNaN(productId)) {
      return res.status(400).json({
         ok: false,
         msg: "Invalid product ID",
      });
   }

   try {
      const productRepository = typeorm.getRepository(productTable);
      const product = await productRepository.findOne({
         where: { product_id: productId },
      });

      if (!product) {
         return res.status(404).json({
            ok: false,
            msg: "Product not found",
         });
      }

      return res.status(200).json({
         ok: true,
         data: product,
      });
   } catch (err) {
      console.error(err);
      return res.status(500).json({
         ok: false,
         msg: "Internal server error",
      });
   }
});

router.post("/update_product", upload.array("files"), async function (req, res) {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }
   try {
      const productRepository = typeorm.getRepository(productTable);
      const existingProduct = await productRepository.findOne({
         where: { product_id: parseInt(req.query.id, 10) },
      });
      if (!existingProduct) {
         return res.status(400).json({ error: "Product with this id does not exist" });
      }

      const categoryRepository = typeorm.getRepository(productCategoriesTable);
      const existingCategory = await categoryRepository.findOne({
         where: { category_id: parseInt(req.body.category_id, 10) },
      });
      if (!existingCategory) {
         return res.status(400).json({ error: "Category with this id does not exist" });
      }

      let image_names = existingProduct.image_url;

      if (req.files && req.files.length > 0) {
         await deleteImagesAsync(image_names);
         image_names = await upload_image();
      }

      existingProduct.name = req.body.name || existingProduct.name;
      existingProduct.description = req.body.product_description || existingProduct.description;
      existingProduct.price = req.body.price ? parseInt(req.body.price, 10) : existingProduct.price;
      // existingProduct.category_id = existingCategory.category_id;
      existingProduct.image_url = image_names;
      existingProduct.quantity = req.body.quantity || existingProduct.quantity;

      await productRepository.save(existingProduct);

      return res.status(200).json({ ok: true, data: existingProduct });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, msg: "Internal server error" });
   }
});

router.post("/addProductVariationOption", async (req, res) => {
   var user_id = null;
   try {
      user_id = getUserIdFromToken(req.headers["authorization"].replace("Bearer ", ""));
   } catch (err) {
      console.error(err);
      return res.status(401).json({
         ok: false,
         msg: "Token is malformed or expired",
      });
   }
   const { product_id, variation_options } = req.body;

   if (!product_id || !Array.isArray(variation_options) || variation_options.length === 0) {
      return res
         .status(400)
         .json({ ok: false, msg: "Product ID and Variation Options are required" });
   }

   try {
      const productRepository = typeorm.getRepository(productTable);
      const variationOptionRepository = typeorm.getRepository(variationOptionTable);
      const productConfigRepository = typeorm.getRepository(productConfigTable);

      const product = await productRepository.findOne({ where: { product_id } });
      if (!product) {
         return res.status(404).json({ ok: false, msg: "Product not found" });
      }

      const newProductConfigs = [];

      for (const option of variation_options) {
         const variationOption = await variationOptionRepository.findOne({
            where: { variation_option_id: option.variation_option_id },
         });

         if (!variationOption) {
            return res.status(404).json({
               ok: false,
               msg: `Variation option not found for ID: ${option.variation_option_id}`,
            });
         }

         const newProductConfig = productConfigRepository.create({
            product_id,
            variation_option_id: option.variation_option_id,
         });

         newProductConfigs.push(newProductConfig);
      }
      await productConfigRepository.save(newProductConfigs);
      return res.status(201).json({ ok: true, data: newProductConfigs });
   } catch (err) {
      console.error("Error adding variation options:", err);
      return res.status(500).json({ ok: false, msg: "Internal server error" });
   }
});

router.get("/getProductVariationOptions", async (req, res) => {
   const { product_id } = req.query;

   if (!product_id) {
      return res.status(400).json({ ok: false, msg: "Product ID is required" });
   }

   try {
      const productConfigRepository = typeorm.getRepository(productConfigTable);

      const productConfigs = await productConfigRepository.find({
         where: { product_id },
         relations: ["variationOptionTable"], // Fetch related variation options
      });

      const variationOptions = productConfigs.map((config) => ({
         variation_option_id: config.variationOptionTable.variation_option_id,
         name: config.variationOptionTable.name,
         variation_id: config.variationOptionTable.variation_id,
      }));

      return res.status(200).json({ ok: true, data: variationOptions });
   } catch (err) {
      console.error("Error fetching variation options:", err);
      return res.status(500).json({ ok: false, msg: "Internal server error" });
   }
});

// for customer
router.get("/get_top_product", limiter, async function (req, res) {
   try {
      const { category_id, limit } = req.query;

      if (!category_id) {
         return res.status(400).json({ ok: false, msg: "Category ID is required" });
      }

      const productRepository = typeorm.getRepository(productTable);

      // Find products by category and limit the number of results
      const products = await productRepository
         .createQueryBuilder("product")
         .innerJoinAndSelect("product.productCategoriesTable", "productCategoriesTable")
         .where("productCategoriesTable.category_id = :category_id", { category_id })
         .limit(limit)
         .getMany();

      return res.status(200).json({ ok: true, data: products });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, msg: "internal server error" });
   }
});

// router.get("/test" , async (req , res) => {
//    try{
//       const productRepository = typeorm.getRepository(productTable);
//       const products = await productRepository.find();
//       products.forEach((product)=>{
//          product.header_image_url = product.image_url[0];
//       });
//       await productRepository.save(products);
//       return res.status(200).json({ ok: true, data: products });
//    }catch(err){
//       console.error(err);
//       return res.status(500).json({ ok: false, msg: "internal server error" });
//    }
// })

router.get("/get_product_details", async (req, res) => {
   try {
      const { product_id } = req.query;
      if (!product_id) {
         return res.status(400).json({ ok: false, msg: "Product ID is required" });
      }
      const productRepository = typeorm.getRepository(productTable);
      const product = await productRepository.findOne({
         where: { product_id },
         relations: ["productCategoriesTable"],
      });
      if (!product) {
         return res.status(404).json({ ok: false, msg: "Product not found" });
      }
      const suggestedProduct = await productRepository.find({
         where: { category_id: product.category_id },
         order: {
            product_id: "DESC",
         },
         take: 4,
      });
      return res.status(200).json({ ok: true, data: product, suggestedProduct: suggestedProduct });
   } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, msg: "internal server error" });
   }
});

router.get("/search", async (req, res) => {
   try {
      const { title = "", page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const connection = typeorm.getConnection();

      const rawData = await connection.query(
         `
       SELECT p.product_id,
              p.name,
              p.description,
              p.quantity,
              p.ratings,
              p.image_url,
              p.price,
              p.created_at,
              p.updated_at,
              p.header_image_url,
              c.name AS category_name,
              json_agg(DISTINCT jsonb_build_object('variation_name', v.name, 'variation_option_name', option.name)) AS variations
       FROM product p
       INNER JOIN product_category c ON p.category_id = c.category_id
       INNER JOIN product_config config ON p.product_id = config.product_id
       INNER JOIN variation_option option ON config.variation_option_id = option.variation_option_id
       INNER JOIN variation v ON option.variation_id = v.variation_id
       WHERE p.name ILIKE $1 OR c.name ILIKE $2
       GROUP BY p.product_id, c.name
       LIMIT $3 OFFSET $4
       `,
         [`%${title}%`, `%${title}%`, parseInt(limit), parseInt(skip)]
      );

      const countData = await connection.query(
         `
       SELECT COUNT(*) as count
       FROM product p
       LEFT JOIN product_category c ON p.category_id = c.category_id
       WHERE p.name ILIKE $1 OR c.name ILIKE $2
       `,
         [`%${title}%`, `%${title}%`]
      );

      const productCount = parseInt(countData[0].count, 10);
      const totalPages = Math.ceil(productCount / limit);

      res.status(200).json({
         ok: true,
         data: rawData,
         pagination: {
            total: productCount,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages,
         },
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({
         ok: false,
         msg: "Internal Server Error",
      });
   }
});

module.exports = router;
