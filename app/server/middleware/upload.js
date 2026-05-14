import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadFiles = (options = {}) => {
  const { maxFiles = 10, fieldName = 'files' } = options;

  return async (req, res, next) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        req.uploadedFiles = [];
        return next();
      }

      const files = req.files[fieldName];
      if (!files) {
        req.uploadedFiles = [];
        return next();
      }

      const filesArray = Array.isArray(files) ? files : [files];
      const limitedFiles = filesArray.slice(0, maxFiles);

      const uploadPromises = limitedFiles.map(async (file) => {
        const result = await uploadToCloudinary(file);
        return {
          url: result.url,
          publicId: result.publicId,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
          name: file.name,
          size: file.size,
        };
      });

      req.uploadedFiles = await Promise.all(uploadPromises);
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
    }
  };
};

export const uploadSingle = (options = {}) => {
  const { fieldName = 'file' } = options;

  return async (req, res, next) => {
    try {
      if (!req.files || !req.files[fieldName]) {
        req.uploadedFile = null;
        return next();
      }

      const file = req.files[fieldName];
      const result = await uploadToCloudinary(file);

      req.uploadedFile = {
        url: result.url,
        publicId: result.publicId,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        name: file.name,
        size: file.size,
      };
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: `Upload failed: ${error.message}` });
    }
  };
};