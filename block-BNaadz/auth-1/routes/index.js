var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Registration' });
});

router.get('/protected', auth.loggedInUser, function (req, res, next) {
  console.log(req.session);
  res.render('dashboard');
});

module.exports = router;
