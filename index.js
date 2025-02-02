const express = require("express");
const sharp = require("sharp");

const app = express();
const PORT = 3000;

app.get("/image", async (req, res) => {
  const sizeInMB = parseInt(req.query.size, 10);

  if (isNaN(sizeInMB) || sizeInMB <= 0) {
    return res.status(400).json({ error: "Invalid size parameter" });
  }

  // Fixed image dimensions
  const width = 1024;
  const height = 1024;

  try {
    // Generate a buffer with the required size
    const totalBytes = sizeInMB * 1024 * 1024;
    const imageBuffer = await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();

    // Pad the buffer to match the requested size
    const paddedBuffer = Buffer.concat([imageBuffer, Buffer.alloc(Math.max(0, totalBytes - imageBuffer.length))]);

    res.set("Content-Type", "image/png");
    res.send(paddedBuffer);
  } catch (error) {
    res.status(500).json({ error: "Error generating image", text: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
