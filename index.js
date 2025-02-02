const express = require("express");
const sharp = require("sharp");

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  return res.status(200).send("Working on /");
});

app.get("/image", async (req, res) => {
  const sizeInKB = parseInt(req.query.size, 10); // Get size in KB

  if (isNaN(sizeInKB) || sizeInKB < 1) {
    return res
      .status(400)
      .json({ error: "Invalid size parameter (Min: 50KB)" });
  }

  try {
    // Convert size format (KB -> MB if needed)
    const formattedSize =
      sizeInKB >= 1024 ? `${(sizeInKB / 1024).toFixed(1)}MB` : `${sizeInKB}KB`;
    const fileName = `${formattedSize.replace(".", "_")}.jpeg`; // e.g., "1MB.jpeg" or "512KB.jpeg"

    // Dynamically adjust image resolution
    let width = 512;
    let height = 512;

    if (sizeInKB > 500) {
      width = 1024;
      height = 1024;
    }
    if (sizeInKB > 5000) {
      width = 2048;
      height = 2048;
    }

    // Create a base red image
    let image = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }, // Red background
      },
    });

    // Add text overlay with formatted size
    if (sizeInKB > 10) {
      const svgText = `
        <svg width="${width}" height="${height}">
          <text x="50%" y="50%" font-size="100" text-anchor="middle" fill="white" dy=".3em">${formattedSize}</text>
        </svg>`;

      image = image.composite([{ input: Buffer.from(svgText) }]);
    }

    // Generate JPEG with adjustable quality
    let imageBuffer = await image.jpeg({ quality: 80 }).toBuffer();

    // Increase buffer to match requested size
    const totalBytes = sizeInKB * 1024;
    imageBuffer = Buffer.concat([
      imageBuffer,
      Buffer.alloc(Math.max(0, totalBytes - imageBuffer.length)),
    ]);

    res.set("Content-Type", "image/jpeg");
    res.set("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(imageBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error generating image", text: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
