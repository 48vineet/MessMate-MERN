// middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed'), false);
  }
};

// Multer configuration for local storage (temporary)
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const hash = crypto.createHash('md5').update(file.originalname + uniqueSuffix).digest('hex');
    cb(null, file.fieldname + '-' + hash + path.extname(file.originalname));
  }
});

// Multer configuration for memory storage (for Cloudinary)
const memoryStorage = multer.memoryStorage();

// Create multer instance for local upload
const localUpload = multer({
  storage: localStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Create multer instance for memory upload (Cloudinary)
const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Cloudinary upload function
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: options.folder || 'messmate',
      use_filename: true,
      unique_filename: true,
      ...options
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Middleware to upload single file to Cloudinary
const uploadSingleToCloudinary = (fieldName, folder = 'messmate') => {
  return async (req, res, next) => {
    // Use memory upload
    memoryUpload.single(fieldName)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB.'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field.'
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      // If no file uploaded, continue
      if (!req.file) {
        return next();
      }

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: folder,
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });

        // Add Cloudinary result to request
        req.cloudinaryResult = {
          public_id: result.public_id,
          url: result.secure_url,
          originalName: req.file.originalname,
          size: req.file.size
        };

        next();
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to cloud storage'
        });
      }
    });
  };
};

// Middleware to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = (fieldName, maxCount = 5, folder = 'messmate') => {
  return async (req, res, next) => {
    // Use memory upload for multiple files
    memoryUpload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File size too large. Maximum size is 5MB per file.'
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: `Too many files. Maximum ${maxCount} files allowed.`
            });
          }
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }

      // If no files uploaded, continue
      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Upload all files to Cloudinary
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, {
            folder: folder,
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          })
        );

        const results = await Promise.all(uploadPromises);

        // Add Cloudinary results to request
        req.cloudinaryResults = results.map((result, index) => ({
          public_id: result.public_id,
          url: result.secure_url,
          originalName: req.files[index].originalname,
          size: req.files[index].size
        }));

        next();
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to upload images to cloud storage'
        });
      }
    });
  };
};

// Middleware for avatar upload
const uploadAvatar = uploadSingleToCloudinary('avatar', 'messmate/avatars');

// Middleware for menu item images
const uploadMenuImages = uploadMultipleToCloudinary('images', 3, 'messmate/menu');

// Middleware for feedback images
const uploadFeedbackImages = uploadMultipleToCloudinary('images', 2, 'messmate/feedback');

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded.'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields in form.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + err.message
        });
    }
  }

  // If it's not a multer error, pass it to the next error handler
  next(err);
};

// Validate image dimensions (optional middleware)
const validateImageDimensions = (minWidth = 100, minHeight = 100, maxWidth = 2000, maxHeight = 2000) => {
  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const sharp = require('sharp');
    
    try {
      const files = req.files || [req.file];
      
      for (const file of files) {
        if (file.buffer) {
          const metadata = await sharp(file.buffer).metadata();
          
          if (metadata.width < minWidth || metadata.height < minHeight) {
            return res.status(400).json({
              success: false,
              message: `Image dimensions too small. Minimum size: ${minWidth}x${minHeight}px`
            });
          }
          
          if (metadata.width > maxWidth || metadata.height > maxHeight) {
            return res.status(400).json({
              success: false,
              message: `Image dimensions too large. Maximum size: ${maxWidth}x${maxHeight}px`
            });
          }
        }
      }
      
      next();
    } catch (error) {
      console.error('Image validation error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid image file'
      });
    }
  };
};

module.exports = {
  // Multer instances
  localUpload,
  memoryUpload,
  
  // Cloudinary upload functions
  uploadToCloudinary,
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  
  // Specific upload middlewares
  uploadAvatar,
  uploadMenuImages,
  uploadFeedbackImages,
  
  // Utility middlewares
  handleUploadError,
  validateImageDimensions,
  
  // File filter
  fileFilter
};
