var express = require('express');
const { request } = require('../app');
var router = express.Router();

var database = require('../database');

/* GET home page. */
router.get('/', function(req, res) {

    database.query('SELECT QuestionID, Qsubject , Description,UserID,Image from quest ORDER BY DatePosted DESC', function(err, rows) {
        if (err) {
            res.render('index', { title: 'Express', session: req.session, data: '' });
        } else {

            res.render('index', { title: 'Express', session: req.session, data: rows });

        }
    });

});

router.post('/login', function(request, response, next) {

    var user_type = request.body.utype;
    var user_email_address = request.body.username;
    var user_password = request.body.password;

    if (user_type == 'user') {

        //general user login
        if (user_email_address && user_password) {
            query = `
          SELECT * FROM user 
          WHERE EmailID = "${user_email_address}"
          `;
            console.log(query);
            database.query(query, function(error, data) {

                if (data.length > 0) {
                    console.log(data)
                    for (var count = 0; count < data.length; count++) {
                        if (data[count].Password == user_password) {
                            request.session.user_id = data[count].UserID;
                            request.session.userType = user_type;

                            response.redirect("/");
                        } else {
                            response.send('Incorrect Password');
                        }
                    }
                } else {
                    response.send('Incorrect Email Address');
                }
                response.end();
            });
        } else {
            response.send('Please Enter Email Address and Password Details');
            response.end();
        }
    } else if (user_type == 'admin') {
        // admin login 
        if (user_email_address && user_password) {
            query = `
          SELECT * FROM admin 
          WHERE AdminName = "${user_email_address}"
          `;
            console.log(query);
            database.query(query, function(error, data) {

                if (data.length > 0) {
                    console.log(data)
                    for (var count = 0; count < data.length; count++) {
                        if (data[count].Password == user_password) {
                            request.session.user_id = data[count].AdminID;
                            request.session.userType = user_type;

                            response.redirect("/");
                        } else {
                            response.send('Incorrect Password');
                        }
                    }
                } else {
                    response.send('Incorrect Email Address');
                }
                response.end();
            });
        } else {
            response.send('Please Enter Email Address and Password Details');
            response.end();
        }
    }



});

router.post('/create', function(request, response, next) {
    // store all the user input data
    const userDetails = request.body;
    //console.log(userDetails);
    // insert user data into users table
    var sql = 'INSERT INTO user SET ?';
    database.query(sql, userDetails, function(err, data) {
        if (err) throw err;
        console.log("Data is inserted successfully ");
    });
    response.redirect('/'); // redirect to index page after inserting the data
});

router.get('/logout', function(request, response, next) {

    request.session.destroy();

    response.redirect("/");

});

router.post('/search', function(request, response) {
    var kw = request.body.searchkeyword;
    if (kw == '') {
        response.redirect('/');
    }
    // IMAGE FUNCTIONALITY NEEDS TO BE ADDED
    var searchquery = `SELECT QuestionID,QSubject,Description,Image,DatePosted FROM quest WHERE QuestionID IN (SELECT questID FROM keywords WHERE keyword LIKE '%${kw}%') order by DatePosted DESC;`;
    console.log("QUERY :", searchquery);
    database.query(searchquery, function(err, searchdata) {
        console.log("DATA :", searchdata)
        if (searchdata.length > 0) {
            response.render('search', { data: searchdata, session: request.session })
        } else {
            response.render('search', { data: '', session: request.session })
            console.log("No search results found! Try some other keyword.")
        }
    })
});

router.get('/myans/:QuestionID', function(request, response) {
    var qid = request.params.QuestionID;
    console.log(qid)
    var sql = `SELECT Answer,answer.Image as aImage ,quest.QuestionID as qid ,Qsubject,Description,quest.Image as qImage FROM stackoverflowclone.answer JOIN  stackoverflowclone.quest on answer.QuestionID = '${qid}' and quest.QuestionID='${qid}';`;

    console.log("query of my ans ", sql);

    database.query(sql, function(err, result) {
        if (result.length > 0) {
            response.render('viewAns', { data: result, session: request.session });
        } else {
            response.send('<h1>No Answers Posted yet.</h1>')
        }
    })
});

router.get('/viewchart', function(req, res) {
    console.log("move to")
    var sql = `select keyword,count(*) as total from keywords group by keyword order by total desc limit 5;`
    console.log(sql)
    database.query(sql, function(err, result) {
        var message = '';
        if (result.length > 0) {
            res.render('dashboard', { result: result, message: message, session: req.session });
        } else {
            message = "No Data!"
            res.render('dashboard', { result: '', message: message, session: req.session });
        }
    })

})

module.exports = router;