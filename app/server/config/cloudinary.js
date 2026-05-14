import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Drop-in replacement for cloudinary.uploader.upload
export const uploadToCloudinary = async (file) => {
  try {
    const sourceFile = file.tempFilePath || file;
    const ext = path.extname(typeof file === 'string' ? file : file.name || '.jpg');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const destPath = path.join(uploadsDir, filename);

    if (typeof sourceFile === 'string') {
      // Copy from temp path
      fs.copyFileSync(sourceFile, destPath);
    } else {
      await new Promise((resolve, reject) =>
        file.mv(destPath, (err) => (err ? reject(err) : resolve()))
      );
    }

    return {
      url: `/uploads/${filename}`,
      publicId: filename,
    };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Drop-in replacement for cloudinary.uploader.destroy
export const deleteFromCloudinary = (publicId) => {
  if (!publicId) return;
  const filePath = path.join(uploadsDir, publicId);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Local file delete error:', err);
    }
  }
};

// Dummy default export so `import cloudinary from './config/cloudinary.js'` doesn't break
export default { uploader: { upload: uploadToCloudinary, destroy: deleteFromCloudinary } };