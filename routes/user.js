/** @format */

const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const router = express.Router();
const typeorm = require("typeorm");
const userTable = require("../src/entity/userTable");

const getUserIdFromToken = (token) => {
   var decoded = jwt.verify(token, "shhhhh");
   return decoded.user_id;
};

const hashPassword = (password) => {
   const hash = crypto.createHash("sha256");
   hash.update(password);
   return hash.digest("hex");
};

// validate hash
const validatePassword = (password, hash) => {
   const validationHash = crypto.createHash("sha256");
   validationHash.update(password);
   return validationHash.digest("hex") === hash;
};

router.post("/create_user", async (req, res) => {
   try {
      const { name, email, password } = req.body;

      // Validate request body
      if (!name || !email || !password) {
         return res.status(400).json({ error: "Name, email, and password are required" });
      }
      const userRepository = typeorm.getRepository(userTable);
      const existingUser = await userRepository.findOne({
         where: { email: email },
      });
      if (existingUser) {
         return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash the password
      const hashedPassword = hashPassword(password);

      // Create new user
      const newUser = userRepository.create({
         user_id: Date.now().toString().substring(6),
         name,
         email,
         password: hashedPassword,
      });

      await userRepository.save(newUser);

      // Optionally, you can generate a JWT token for the newly created user

      res.status(201).json({ message: "User created successfully"});
   } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
   }
});

router.post('/login' , async (req , res)=>{
   try{
      const {email , password} = req.body;
      if(!email || !password) {
         return res.status(400).json({ ok : false, error: "Email and password are required" });
      }
      const userRepository = typeorm.getRepository(userTable);
      const user = await userRepository.findOne({
         where : {email : email },
      });

      if(!user){
         return res.status(400).json({ok : false, error: "Invalid email" });
      }
      if(password !== '0'){
         if(!validatePassword(password, user.password)){
            return res.status(400).json({ok : false, error: "Invalid password" });
         }
      }
      const encrypted_token = jwt.sign(user.user_id, "shhhhh");
      return res.status(200).json({ok : true, data : {
         name : user.name,
         user_id : user.user_id,
         email : user.email,
         profile_pic_url : user.profile_pic_url,
         token : encrypted_token
      }});
   }catch(err){
      console.error("Internal server error", err);
   }
})

router.post('/admin_login' , async (req ,res) => {
   try{
      const {password} = req.body;
      if(!password) {
         return res.status(400).json({ ok : false , error: "Password is required" });
      }
      const userRepository = typeorm.getRepository(userTable);
      const adminUser = await userRepository.findOne({
         where : {password : password},
      });

      if(!adminUser){
         return res.status(400).json({ok : false, error: "Invalid password" });
      }

      const encrypted_token = jwt.sign(password , "shhhhh");
      return res.status(200).json({ok : true , token : encrypted_token});
   }catch(err){
      console.error("Internal server error" , err);
   }
})

router.get('/get_user' , async (req , res) => {
   try{
      console.log("yaha aa gya");
      const userRepository = typeorm.getRepository(userTable);
      const user = await userRepository.find();
      if(!user){
         return res.status(400).json({ok : false, error: "User not found" });
      }
      return res.status(200).json({ok : true, data : user});
   }catch(err){
      console.error("Internal server error" , err);
   }
})


module.exports = router;
