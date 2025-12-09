const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imagesController = require('../controllers/imagesController');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения'));
        }
    }
});

// Маршруты
router.get('/', imagesController.getAllImages);
router.get('/:id', imagesController.getImageById);
router.get('/file/:filename', imagesController.getImageFile);
router.get('/search/query', imagesController.searchImages);
router.post('/upload', upload.single('image'), imagesController.uploadImage);
router.delete('/:id', imagesController.deleteImage);

module.exports = router;
