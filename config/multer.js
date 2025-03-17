const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/uploads/user-images'));
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname.replace(/\s/g, "")}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });


