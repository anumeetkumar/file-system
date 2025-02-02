const express = require("express");
const sharp = require("sharp");

const app = express();
const PORT = 3000;

app.get("/image", async (req, res) => {
  const sizeInKB = parseInt(req.query.size, 10); // Get size in KB

  if (isNaN(sizeInKB) || sizeInKB < 1) {
    return res.status(400).json({ error: "Invalid size parameter (Min: 50KB)" });
  }

  try {
    // Dynamically adjust image resolution
    let width = 512;
    let height = 512;

    if (sizeInKB > 500) { // Increase resolution for larger sizes
      width = 1024;
      height = 1024;
    }
    if (sizeInKB > 5000) { // Even higher resolution for bigger sizes
      width = 2048;
      height = 2048;
    }

    // Create an image
    let image = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }, // Red background
      },
    });

    // Generate JPEG with adjustable quality
    let imageBuffer = await image.jpeg({ quality: 80 }).toBuffer();

    // Increase buffer to match requested size
    const totalBytes = sizeInKB * 1024;
    imageBuffer = Buffer.concat([imageBuffer, Buffer.alloc(Math.max(0, totalBytes - imageBuffer.length))]);

    res.set("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: "Error generating image", text: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
