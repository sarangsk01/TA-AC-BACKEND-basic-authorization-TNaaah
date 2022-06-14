var express = require('express');
var router = express.Router();
const Article = require('../models/Article');
const Comment = require('../models/Comment');
var auth = require('../middlewares/auth');

/* GET users listing. */
router.get('/', (req, res, next) => {
  Article.find({}, (err, articles) => {
    console.log(err, articles);
    if (err) return next(err);
    res.render('listArticles.ejs', { articles });
  });
});

router.get('/new', auth.loggedInUser, (req, res, next) => {
  res.render('articleForm.ejs');
});

router.get('/:id', (req, res, next) => {
  var id = req.params.id;
  Article.findById(id)
    .populate('author', 'name email')
    .exec((err, article) => {
      if (err) return next(err);
      console.log(article);
      res.render('singleArticle.ejs', { article });
    });
});

router.use(auth.loggedInUser); // middleware

router.post('/', (req, res, next) => {
  req.body.tags = req.body.tags.trim().split(' ');
  req.body.author = req.user.id;
  Article.create(req.body, (err, createdArticle) => {
    if (err) return res.redirect('/articles/new');
    res.redirect('/articles');
  });
});

router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id;
  Article.findById(id, (err, article) => {
    console.log(article);
    if (err) return next(err);
    res.render('updateArticleForm', { article });
  });
});

router.post('/:id', (req, res, next) => {
  var id = req.params.id;
  Article.findByIdAndUpdate(id, req.body, (err, article) => {
    if (err) return next(err);
    res.redirect('/articles');
  });
});

router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id;
  Article.findByIdAndDelete(id, (err, article) => {
    if (err) return next(err);
    Comment.remove({ articleId: article.id }, (err) => {
      if (err) return next(err);
      res.redirect('/articles');
    });
  });
});

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id;
  Article.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, article) => {
    if (err) return next(err);
    res.redirect('/articles/' + id);
  });
});

router.post('/:articleId/comments', (req, res, next) => {
  var articleId = req.params.articleId;
  console.log(req.body);
  req.body.articleId = articleId;
  Comment.create(req.body, (err, comment) => {
    console.log(err, comment);
    if (err) return next(err);
    Article.findByIdAndUpdate(
      articleId,
      { $push: { comments: comment.id } },
      (err, article) => {
        if (err) return next(err);
        res.redirect('/articles/' + articleId);
      }
    );
  });
});

module.exports = router;
