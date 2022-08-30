var express = require('express');

var router = express.Router();

var database = require('../database');
router.get('/', function(request, response, ) {

    response.render('askQuestion', { message: '', session: request.session });
});

router.post('/postquestion', function(request, response) {

    var qtitle = request.body.Qsubject;
    var desc = request.body.Desc;

    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    // prints date in YYYY-MM-DD format
    console.log(year + "-" + month + "-" + date);

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

    // prints time in HH:MM format
    console.log(hours + ":" + minutes);
    var datetoday = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    var uid = request.session.user_id;

    if (!request.files) {
        //  Query to insert details in question table
        var sql = ''
        if (request.session.userType == 'admin') {
            sql = `INSERT INTO quest (Qsubject,Description,DatePosted,AdminID) VALUES ("${qtitle}","${desc}","${datetoday}","${uid}");`;
        } else {
            sql = `INSERT INTO quest (Qsubject,Description,DatePosted,UserID) VALUES ("${qtitle}","${desc}","${datetoday}","${uid}");`;
        }

        console.log("Query : ", sql);
        database.query(sql, function(err, res) {

                if (err)
                    throw err

                console.log('Question details Inserted successfully ', res.affectedRows)

            })
            //Query to insert keywords into the Keywords table with the question id

        var keywords = request.body.keywords;
        //console.log("this is keyword ", keywords);
        var keywordArr = keywords.split(",");
        // console.log("Keyword Array ", keywordArr, keywordArr.length);

        //var values = [];
        for (let i = 0; i < keywordArr.length; i++) {
            //values.push(keywordArr[i]);
            if (keywordArr[i] == "" || keywordArr[i] == null || keywordArr[i] == undefined) {
                keywordArr.splice(i, 1);
            }
            spacesplit = keywordArr[i].split(" ")
            if (spacesplit.length > 1) {
                keywordArr[i] = spacesplit.join("")
            }
            let keywordSql = `INSERT INTO keywords (questID,keyword) SELECT QuestionID,"${keywordArr[i]}" from quest WHERE Qsubject = "${qtitle}";`;

            database.query(keywordSql, function(err, result) {
                if (err) { throw err; }
                console.log(keywordSql);
                console.log(result);
                console.log("Keyword Record inserted:", result.affectedRows);
            });

        }
        response.redirect('/')
            //return response.status(400).send('No files were uploaded.');
    }


    var file = request.files.uploaded_image;
    var img_name = file.name;




    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

        file.mv('public/images/uploaded_image/' + file.name, function(err) {

            if (err)
                return response.status(500).send(err);
            //  Query to insert details in question table
            var sql = ''
            if (request.session.userType == 'admin') {
                sql = `INSERT INTO quest (Qsubject,Description,DatePosted,AdminID,Image) VALUES ("${qtitle}","${desc}","${datetoday}","${uid}","${img_name}");`;

            } else {
                sql = `INSERT INTO quest (Qsubject,Description,DatePosted,UserID,Image) VALUES ("${qtitle}","${desc}","${datetoday}","${uid}","${img_name}");`;

            }

            console.log("Query : ", sql);
            database.query(sql, function(err, res) {

                if (err)
                    throw err

                console.log('Question details Inserted successfully ', res.affectedRows)

            })

            //Query to insert keywords into the Keywords table with the question id

            var keywords = request.body.keywords;
            //console.log("this is keyword ", keywords);
            var keywordArr = keywords.split(",");
            // console.log("Keyword Array ", keywordArr, keywordArr.length);

            //var values = [];
            for (let i = 0; i < keywordArr.length; i++) {
                //values.push(keywordArr[i]);
                if (keywordArr[i] == "" || keywordArr[i] == null || keywordArr[i] == undefined) {
                    keywordArr.splice(i, 1);
                }
                spacesplit = keywordArr[i].split(" ")
                if (spacesplit.length > 1) {
                    keywordArr[i] = spacesplit.join("")
                }
                let keywordSql = `INSERT INTO keywords (questID,keyword) SELECT QuestionID,"${keywordArr[i]}" from quest WHERE Qsubject = "${qtitle}";`;

                database.query(keywordSql, function(err, result) {
                    if (err) { throw err; }
                    console.log(keywordSql);
                    console.log(result);
                    console.log("Keyword Record inserted:", result.affectedRows);
                });

            }

        });


    } else {
        message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";

        response.render('askQuestion', { message: message });

    }




    response.redirect('/');
});



module.exports = router;