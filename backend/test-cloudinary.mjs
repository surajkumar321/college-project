// backend/test-cloudinary.mjs
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import cloudinary from "./config/cloudinary.js";

async function testUpload() {
  console.log("Cloudinary ready? ", !!cloudinary && typeof cloudinary.uploader.upload === "function");

  try {
    const tmp = "./uploads/test.txt";
    // ensure uploads folder exists
    fs.mkdirSync("./uploads", { recursive: true });
    fs.writeFileSync(tmp, "hello cloudinary test");

    const res = await cloudinary.uploader.upload(tmp, {
      folder: "ai-study-assistant/test",
      resource_type: "auto",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    console.log("UPLOAD OK:", res.public_id, res.secure_url);
    fs.unlinkSync(tmp);
  } catch (err) {
    console.error("TEST UPLOAD ERROR:", err);
  }
}

testUpload();
