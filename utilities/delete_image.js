/** @format */
const supabase = require("../utilities/supabase_connect");

const delete_images = async (image_names) => {
   try {
      const { data, error } = await supabase.storage.from("products").remove(image_names);

      if (error) {
         console.error("Error deleting files:", error.message);
         return false; // Indicate failure
      }
      console.log("Files deleted successfully:", data);
      return true; // Indicate success
   } catch (error) {
      console.error("Error deleting files:", error);
      return false; // Indicate failure
   }
};

module.exports = delete_images;
