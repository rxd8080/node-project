var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var router = express.Router();
var url = 'mongodb://127.0.0.1:27017';
var async = require('async');
var ObjectId = require('mongodb').ObjectId;

router.get('/', function (req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示多少条
  var totalSize = 0; // 总条数
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    async.series([
      function(cb) {
        db.collection('user').find().count(function(err, num) {
          if(err) {
            cb(err);
          }else {
            totalSize = num;
            cb(null);
          }
        })
      },
      function(cb) {
        //limit 限制返回的结果数
        // skip 跳过指定数量的数据
        //db.collection('user).find().limit(5).skip(0)  第一页 
        //db.collection('user).find().limit(5).skip(5)  第二页
        //db.collection('user).find().limit(5).skip(10) 第三页
        db.collection('user').find().limit(pageSize).skip( page * pageSize - pageSize).toArray(function(err, data){
          if(err) {
            cb(err)
          }else {
            cb(null,data)
          }
        })
      }

    ],function(err, result) {
      if(err) {
        console.log('错误', err);
        res.render('error', {
          message:'错误',
          error:err
        })
      }else {
        res.render('users', {
          list:result[1],
          totalPage: Math.ceil(totalSize / pageSize),
          currentPage:page,
          pageSize:pageSize
        })
      }
    })
  })


  // MongoClient.connect(url, function (err, client) {
  //   if (err) {
  //     console.log('连接失败', err);
  //     res.render('error', {
  //       message: '连接失败',
  //       error: err
  //     })
  //     return;
  //   }
  //   var db = client.db('project');
  //   db.collection('user').find().toArray(function (err, data) {
  //     if (err) {
  //       console.log('查询用户数据失败', err);
  //       res.render('error', {
  //         message: '查询失败',
  //         error: err
  //       })
  //     } else {
  //       res.render('users', {
  //         list: data
  //       });
  //     }
  //     client.close();
  //   })
  // })
});

router.post('/login', function (req, res) {
  var username = req.body.name;
  var password = req.body.pwd;
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能是空')
    })
    return;
  }
  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log('连接数据库失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').find({
      username: username,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
        //登录成功
        res.cookie('nickname', data[0].nickname, {
          maxAge: 60 * 60 * 1000
        })
        res.redirect('/');
      }
      client.close();
    })
  })
})

router.post('/register', function (req, res) {
  var username = req.body.username,
    password = req.body.pwd,
    sex = req.body.sex,
    nickname = req.body.nickname,
    isAdmin = req.body.isAdmin === '是' ? true : false,
    age = Number(req.body.age)
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log('连接数据库失败', err);
      res.render('error', {
        message: '连接数据库失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    async.series([
      function (cb) {
        db.collection('user').find({ username: username }).count(function (err, num) {
          if (err) {
            cb(err);
          } else if (num > 0) {
            cb(new Error('该用户名已被注册'));
          } else {
            cb(null);
          }
        })
      },
      function (cb) {
        db.collection('user').insertOne({
          username: username,
          password: password,
          nickname: nickname,
          sex: sex,
          age: age,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function (err, result) {
      if (err) {
        console.log('错误');
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        res.redirect('/login.html');
      }
      client.close();
    })
    // db.collection('user').insertOne({
    //   username: username,
    //   password: password,
    //   nickname: nickname,
    //   sex: sex,
    //   age: age,
    //   isAdmin: isAdmin
    // },function(err) {
    //   if(err) {
    //     console.log('注册失败', err);
    //     res.render('error', {
    //       message:'注册失败',
    //       error: err
    //     })
    //     return;
    //   }else {
    //     res.redirect('/login.html');
    //   }
    //   client.close()
    // })
  })
})


router.get('/delete', function (req, res) {
  var id = req.query.id;
  MongoClient.connect(url, function (err, client) {
    if (err) {
      console.log('连接数据库失败', err);
      res.render('error', {
        message: '连接数据库失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').deleteOne({ _id: ObjectId(id) }, function (err, data) {
      console.log(data)
      if (err) {
        console.log('删除失败', err);
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        //删除成功
        res.redirect('/users');
      }
      client.close();
    })
  })
})




module.exports = router;
