const express= require("express");
const bodyParser = require("body-parser");
const libre = require('libreoffice-convert');
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

app.get("/",function(req,res){
    res.render("docxtopdf");
});

const docxtopdf = function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".docx" &&
      ext !== ".doc"
    ) {
      return callback("This Extension is not supported");
    }
    callback(null, true);
  };
  const docxtopdfupload = multer({storage:storage,fileFilter:docxtopdf})
  app.post('/',docxtopdfupload.single('file'),(req,res) => {
    if(req.file){
      console.log(req.file.path)
  
      const file = fs.readFileSync(req.file.path);
  
      outputFilePath = Date.now() + "output.pdf" 
  
      libre.convert(file,".pdf",undefined,(err,done) => {
        if(err){
          fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
  
          res.send("some error taken place in conversion process")
        }
  
        fs.writeFileSync(outputFilePath, done);
  
        res.download(outputFilePath,(err) => {
          if(err){
            fs.unlinkSync(req.file.path)
          fs.unlinkSync(outputFilePath)
  
          res.send("some error taken place in downloading the file")
          }
  
        //   fs.unlinkSync(req.file.path)
        //   fs.unlinkSync(outputFilePath)
        })
  
  
      })
    }
  })

app.listen(3000, function(){
    console.log("Server listening on port 3000");
});