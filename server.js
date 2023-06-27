const express = require('express')
const app = express()
const mysql = require('mysql')
const multer = require('multer')
const path = require('path')
const cors = require("cors");
const bodyParser = require('body-parser');
 
 
//use express static folder
app.use(cors());
app.use(express.static("./public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db50g5xgurwpgc"
})
 
db.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
 
//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/profile/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
 
//@type   POST
//route for post data

app.post('/getPFP', (req, res) =>  {
    // res.render('layout', { title: 'Movieseat' });
    console.log(req.body);
    db.query(`SELECT pfp_uri FROM user WHERE wallet_addr = "${req.body.wallet_addr}"`, (err, results, fields) => {
        res.setHeader('Content-Type', 'application/json');
        try{
            const result = JSON.parse(JSON.stringify(results))[0];
            return res.end(JSON.stringify({pfp_uri : result.pfp_uri}));
        }catch(err){
            return res.end(JSON.stringify({pfp_uri : "http://127.0.0.1:4000/images/profile/default.png"}));
        }
    })
  });

app.post("/uploadPFP", upload.single('file'), (req, res) => {
    if (!req.file) {
        console.log("No file upload");
    } else {
        console.log(req.file.filename)
        console.log(req.body.wallet_addr)
        var imgsrc = 'http://127.0.0.1:4000/images/profile/' + req.file.filename

        db.query("SELECT count(*) as userCount FROM user WHERE user.wallet_addr=?", [req.body.wallet_addr], (err, results, fields) => {
            if (!err) {
                userCount = JSON.parse(JSON.stringify(results))[0];
                console.log(userCount.userCount);
                if(userCount.userCount != 0){
                    var query = `UPDATE user SET pfp_uri = "${imgsrc}" WHERE wallet_addr = "${req.body.wallet_addr}"`;
                    console.log(query);
                    db.query(query, function(error, data){
                        if (err) throw err;
                        console.log('record updated');
                    });
                }
                else{
                    var query = `INSERT INTO user (wallet_addr, pfp_uri) VALUES ("${req.body.wallet_addr}", "${imgsrc}")`;
                    console.log(query);
                    db.query(query, function(err, result) {
                        if (err) throw err;
                        console.log('record inserted');
                    });
                }
                return res.end(JSON.stringify({pfp_uri : imgsrc}));
            } else {
              console.log(err);
              return res.status(404).send('Sorry user_id does not exits');
            }
        })
        /* var insertData = "INSERT INTO users_file(file_src)VALUES(?)"
        db.query(insertData, [imgsrc], (err, result) => {
            if (err) throw err
            console.log("file uploaded")
        }) */
    }
});
 
//create connection
const PORT = 4000
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`))