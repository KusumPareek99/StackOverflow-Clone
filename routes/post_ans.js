var express = require('express');
var router = express.Router();

var database = require('../database');
router.get('/postans/:QuestionID', function(request, response) {
    var id = request.params.QuestionID;
    console.log(id);
    var sql = `SELECT * FROM quest where QuestionID= ${id}`;
    database.query(sql, function(err, result) {
        if (err) {
            throw err;
        }
        response.render('ans_question', { title: 'Express', message: '', data: result });
    });

});

router.post('/postanswer', function(request, response) {
    var description = request.body.Desc;

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

    var qid = request.body.qid;

    if (!request.files) {
        var sql = ''
        if (request.session.userType = 'admin') {
            sql = `INSERT INTO answer (Answer,PostedDated,QuestionID,AdminID) VALUES ("${description}","${datetoday}","${qid}","${uid}");`;

        } else {
            sql = `INSERT INTO answer (Answer,PostedDated,QuestionID,UserID) VALUES ("${description}","${datetoday}","${qid}","${uid}");`;

        }

        console.log("Query : ", sql);
        database.query(sql, function(err, res) {
            if (err) {
                throw err;
            }
            console.log('Answer without image Inserted successfully ', res.affectedRows);

        })
        response.redirect('/')
    }
    var file = request.files.uploaded_image;
    var img_name = file.name;
    console.log("Question id in post", qid);
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/gif") {

        file.mv('public/images/uploaded_image/' + file.name, function(err) {

            if (err)
                return response.status(500).send(err);
            var sql = ''
                //  Query to insert details in question table
            if (request.session.userType == 'admin') {
                sql = `INSERT INTO answer (Answer,PostedDated,Image,QuestionID,AdminID) VALUES ("${description}","${datetoday}","${img_name}","${qid}","${uid}");`;

            } else {
                sql = `INSERT INTO answer (Answer,PostedDated,Image,QuestionID,UserID) VALUES ("${description}","${datetoday}","${img_name}","${qid}","${uid}");`;
            }
            console.log("Query : ", sql);
            database.query(sql, function(err, res) {
                if (err) {
                    throw err;
                }
                console.log('Answer Inserted successfully ', res.affectedRows)

            })

        });
    } else {
        message = "This format is not allowed , please upload file with '.png','.gif','.jpg'";
        response.render('ans_question', { message: message, data: '' });
    }
    response.redirect('/');
});
module.exports = router;