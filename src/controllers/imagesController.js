const fs = require('fs').promises;
const path = require('path');

class ImagesController {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/images.json');
        this.uploadsPath = path.join(__dirname, '../../public/uploads');
        this.initData();
    }

    async initData() {
        try {
            await fs.access(this.dataPath);
        } catch (error) {
            await fs.writeFile(this.dataPath, JSON.stringify([]));
        }
    }

    async readData() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Ошибка чтения данных:', error);
            return [];
        }
    }

    async writeData(data) {
        try {
            await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Ошибка записи данных:', error);
            throw error;
        }
    }

    // Получить все изображения
    async getAllImages(req, res) {
        try {
            const images = await this.readData();
            res.json({ images });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    // Получить изображение по ID
    async getImageById(req, res) {
        try {
            const { id } = req.params;
            const images = await this.readData();
            const image = images.find(img => img.id === parseInt(id));
            
            if (!image) {
                return res.status(404).json({ error: 'Изображение не найдено' });
            }
            
            res.json({ image });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    // Получить файл изображения
    async getImageFile(req, res) {
        try {
            const { filename } = req.params;
            const filePath = path.join(this.uploadsPath, filename);
            
            res.sendFile(filePath);
        } catch (error) {
            res.status(404).json({ error: 'Файл не найден' });
        }
    }

    // Поиск изображений
    async searchImages(req, res) {
        try {
            const { name } = req.query;
            const images = await this.readData();
            
            const filteredImages = images.filter(img => 
                img.originalname.toLowerCase().includes(name.toLowerCase())
            );
            
            res.json({ images: filteredImages });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка поиска' });
        }
    }

    // Загрузить изображение
    async uploadImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Файл не загружен' });
            }

            const images = await this.readData();
            const newId = images.length > 0 ? Math.max(...images.map(img => img.id)) + 1 : 1;
            
            const newImage = {
                id: newId,
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                uploadedAt: new Date().toISOString()
            };

            images.push(newImage);
            await this.writeData(images);

            res.status(201).json({ 
                message: 'Изображение загружено успешно', 
                image: newImage 
            });
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            res.status(500).json({ error: 'Ошибка загрузки изображения' });
        }
    }

    // Удалить изображение
    async deleteImage(req, res) {
        try {
            const { id } = req.params;
            const images = await this.readData();
            const imageIndex = images.findIndex(img => img.id === parseInt(id));
            
            if (imageIndex === -1) {
                return res.status(404).json({ error: 'Изображение не найдено' });
            }

            const image = images[imageIndex];
            
            // Удалить файл
            try {
                const filePath = path.join(this.uploadsPath, image.filename);
                await fs.unlink(filePath);
            } catch (error) {
                console.error('Ошибка удаления файла:', error);
            }

            // Удалить из данных
            images.splice(imageIndex, 1);
            await this.writeData(images);

            res.json({ message: 'Изображение удалено успешно' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка удаления изображения' });
        }
    }
}

module.exports = new ImagesController();
