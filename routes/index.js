var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
// router.get('/users', function (req, res) {
//   res.render('users');
// })

router.get('/brand', function (req, res) {
  res.render('brand');
})

router.get('/phone', function (req, res) {
  res.render('phone');
})
router.get('/login.html', function (req, res) {
  res.render('login');
})
module.exports = router;
