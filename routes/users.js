var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';


router.get('/', function (req, res, next) {
  MongoClient.connect(url, function(err, client) {
    var db = client.db('project');
    db.collection('user').find().toArray(function(err,data) {
      if(err) {
        console.log('查询用户数据失败', err);
        res.render('error', {
          message:'查询失败',
          error:err
        })
      }else {
        res.render('users', {
          list:data
        });
      }
    })
  })
});


// router.post('/login', function(req, res) {
//   var username = req.body.name;
//   var password = req.body.pwd;
//   MongoClient.connect(url, function(err, client) {
//     var db = client.db('project');
//     db.collection('user').find({
//       username:username,
//       password:password
//     }).toArray(function(err,data){
//       if(err) {
//         res.render('error', {
//           message:'查询失败',
//           error:err
//         })
//       }else {
//         res.cookie('nickname', data[0].nickname, {
//           maxAge: 10 * 60 * 1000
//         })
//         res.redirect('/');
//       }
//       client.close();
//     })
//   })
//   res.send('')
// })
module.exports = router;
