const crypto = require("crypto");
const supabase = require("../utilities/supabase_connect");
const fs = require("fs").promises;
const path = require("path");
const { decode } = require("base64-arraybuffer");

const uploadFolder = path.join(__dirname, "..", "uploads");

const upload_image = async () => {
   const image_names = [];

   try {
      const files = await fs.readdir(uploadFolder);

      for (const file of files) {
         const filePath = path.join(uploadFolder, file);
         const file_data = await fs.readFile(filePath, { encoding: "base64" });
         const fileExt = path.extname(file).toLowerCase();
         const image_name = `products/${crypto.randomUUID()}${fileExt}`;

         const { data, error } = await supabase.storage
            .from("products")
            .upload(image_name, decode(file_data), {
               contentType: "image/png",
            });

         if (error) {
            console.error("Error uploading file:", error.message);
            continue; // Skip to the next file if upload fails
         }
         const publicUrl  = await supabase.storage
         .from("products") // Replace 'bucket_name' with your actual bucket name
         .getPublicUrl(image_name);
         image_names.push(publicUrl.data.publicUrl);
         console.log("File uploaded successfully:", data.Key);
         await fs.unlink(filePath);
         console.log("File deleted successfully:", filePath);
      }
      return image_names;
   } catch (error) {
      console.error("Error processing files:", error);
      return []; // Return empty array in case of any error
   }
};

module.exports = upload_image;
