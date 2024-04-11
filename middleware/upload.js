const multer = require("multer");

const storage = multer.memoryStorage({
    destination: function(req, file, cb){
        cb(null, "/");
    }
});
const upload = multer({
    storage: storage,
    limits:{
        fieldSize: 1024*1024*5
    }
}).any("files");
const singleUpload = multer({
    storage: storage,
    limits:{
        fieldSize: 1024*1024*5
    }
}).single("image")


module.exports = {upload, singleUpload};