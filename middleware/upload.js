const multer = require("multer");
const util = require('util');
const storage = multer.memoryStorage({
    destination: function(req, file, cb){
        cb(null, "/");
    }
});
const manyUpload = multer({
    storage: storage,
    limits:{
        fieldSize: 1024*1024*5
    }
}).array("files",10);
const singleUpload = multer({
    storage: storage,
    limits:{
        fieldSize: 1024*1024*5
    }
}).single("image")

let multipleUploadMiddleware = util.promisify(manyUpload);
let singleUploadMiddleware = util.promisify(singleUpload);


module.exports = {multipleUploadMiddleware, singleUploadMiddleware};