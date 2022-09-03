var express = require('express');
const { request, response } = require('../app');
var router = express.Router();

var database = require('../database');

/* GET home page. */
router.get('/', function(req, res) {

    database.query('SELECT QuestionID, Qsubject , Description,UserID,Image,date_format(DatePosted,"%m-%d-%y %h:%i %p") AS DatePosted from quest ORDER BY DatePosted DESC', function(err, rows) {
        if (err) {
            res.render('index', { title: 'Express', session: req.session, data: '', message: '' });
        } else {

            res.render('index', { title: 'Express', session: req.session, data: rows, message: '' });

        }
    });

});

router.post('/login', function(request, response, next) {

    var user_type = request.body.utype;
    var user_email_address = request.body.username;
    var user_password = request.body.password;
    msg = '';
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
                            //response.send('Incorrect Password');
                            msg = 'Incorrect Password'
                            response.render('loginError', { title: 'Express', session: request.session, message: msg });

                        }
                    }
                } else {
                    //response.send('Incorrect Email Address');
                    msg = 'Incorrect Email Address'
                    response.render('loginError', { title: 'Express', session: request.session, message: msg });

                }
                response.end();
            });
        } else {
            //response.send('Please Enter Email Address and Password Details');
            msg = 'Please Enter Email Address and Password Details'
            response.render('loginError', { title: 'Express', session: request.session, data: rows, message: msg });

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
    // const userDetails = request.body;
    const email = request.body.EmailID;
    const pass = request.body.Password;
    //console.log(userDetails);
    // insert user data into users table
    var sql = `INSERT INTO user (EmailID,Password) VALUES ("${email}","${pass}")`;
    database.query(sql, function(err, data) {
        if (err) throw err;
        console.log("Data is inserted successfully ");
    });
    response.redirect('/'); // redirect to index page after inserting the data
});

router.get('/logout', function(request, response, next) {

    request.session.destroy();

    response.redirect("/");

});

router.get('/forgetpass', function(request, response) {
    //response.render('forgetPass');

    response.render('forgetPass', { message: '', type: '' })
})

router.post('/search', function(request, response) {
    var kw = request.body.searchkeyword;
    if (kw == '') {
        response.redirect('/');
    }
    var searchquery = `SELECT QuestionID,QSubject,Description,Image,date_format(DatePosted,"%m-%d-%y %h:%i %p") AS DatePosted FROM quest WHERE QuestionID IN (SELECT questID FROM keywords WHERE keyword LIKE '%${kw}%') order by DatePosted DESC;`;
    console.log("QUERY :", searchquery);
    database.query(searchquery, function(err, searchdata) {
        console.log("DATA :", searchdata)
        if (searchdata.length > 0) {
            response.render('search', { data: searchdata, session: request.session, keyword: kw })
        } else {
            response.render('search', { data: '', session: request.session, keyword: kw })
            console.log("No search results found! Try some other keyword.")
        }
    })
});

router.get('/myans/:QuestionID', function(request, response) {
    var qid = request.params.QuestionID;
    console.log(qid)
    var sql = `SELECT answer.UserID AS uid, Answer,answer.Image as aImage ,quest.QuestionID as qid ,Qsubject,Description,quest.Image as qImage FROM stackoverflowclone.answer JOIN  stackoverflowclone.quest on answer.QuestionID = '${qid}' and quest.QuestionID='${qid}';`;
    msg = ''
    console.log("query of my ans ", sql);

    database.query(sql, function(err, result) {
        if (result.length > 0) {
            response.render('viewAns', { data: result, session: request.session, message: msg });
        } else {
            //response.send('<h1>No Answers Posted yet.</h1>')
            msg = 'No Answers Posted yet.'
            response.render('viewAns', { data: '', session: request.session, message: msg });
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

});

router.get('/viewusers', function(req, res) {
    var sql = `SELECT quest.UserID AS uid,user.EmailID as eid,count(quest.UserID) AS TotalQuestionsAsked FROM stackoverflowclone.quest,stackoverflowclone.user where quest.UserID=user.UserID group by quest.UserID order by count(quest.UserID)DESC;`
    console.log(sql);
    database.query(sql, function(err, result) {
        var message = "";
        if (result.length > 0) {
            res.render('viewUsers', { result: result, message: message, session: req.session });
        } else {
            message = "No Users to show";
            res.render('viewUsers', { result: '', message: message, session: req.session });
        }
    })

})



router.get('/tags', function(req, res) {
    var sql = `select keyword,count(*) as total from keywords group by keyword order by total desc;`
    console.log(sql)
    database.query(sql, function(err, result) {
        var message = '';
        if (result.length > 0) {
            res.render('tags', { result: result, message: message, session: req.session });
        } else {
            message = "No Data!"
            res.render('tags', { result: '', message: message, session: req.session });
        }
    });
});

router.get('/tagsredirect/:tag', function(request, response) {
    var kw = request.params.tag;
    console.log(kw)
    if (kw == '') {
        response.redirect('/');
    }
    var searchquery = `SELECT QuestionID,QSubject,Description,Image,date_format(DatePosted,"%m-%d-%y %h:%i %p") AS DatePosted FROM quest WHERE QuestionID IN (SELECT questID FROM keywords WHERE keyword LIKE '%${kw}%') order by DatePosted DESC;`;
    console.log("QUERY :", searchquery);
    database.query(searchquery, function(err, searchdata) {
        console.log("DATA :", searchdata)
        if (searchdata.length > 0) {
            response.render('search', { data: searchdata, session: request.session, keyword: kw })
        } else {
            response.render('search', { data: '', session: request.session, keyword: kw })
            console.log("No search results found! Try some other keyword.")
        }
    })
});

router.get('/upvote/:uid', function(req, res) {

    var uid = req.params.uid;
    var sql = `UPDATE stackoverflowclone.user SET Points = Points + 1 WHERE (UserID = ${uid});`;
    console.log("UPVOTE QUERY : ", sql);
    database.query(sql, function(err) {
        if (err) throw err;

    })
    res.redirect('/')

})
router.get('/upvote/:uid', function(req, res) {

    var uid = req.params.uid;
    var sql = `UPDATE stackoverflowclone.user SET Points = Points + 1 WHERE (UserID = ${uid});`;
    console.log("UPVOTE QUERY : ", sql);
    database.query(sql, function(err) {
        if (err) throw err;

    })
    res.redirect('/')

})

router.get('/downvote/:uid', function(req, res) {

    var uid = req.params.uid;
    var sql = `UPDATE stackoverflowclone.user SET Points = Points - 1 WHERE (UserID = ${uid});`;
    console.log("UPVOTE QUERY : ", sql);
    database.query(sql, function(err) {
        if (err) throw err;

    })
    res.redirect('/')

})

router.get('/about', function(req, res) {
    res.render("about", { session: req.session });
})

module.exports = router;