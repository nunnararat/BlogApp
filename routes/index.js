var express = require('express');
var router = express.Router();
var moment = require('moment');

var {check, validationResult} = require('express-validator')

// connect DB
var mongodb = require('mongodb');   
var db = require('monk')('127.0.0.1:27017/BlogDB')
      
/* GET home page. */
router.get('/', async function(req, res, next) {
  var blogs = db.get('posts');
  var categories = db.get('categories');
  var blog = await blogs.find({}, {});
  var category = await categories.find({}, {});
  res.render('index', {
    posts: blog,     
    categories: category,  
    moment:moment
  });
});   

router.get('/show/:id', async function(req, res, next) {
  var blogs = db.get('posts');
  var categories = db.get('categories');
  var blog = await blogs.find(req.params.id, {});
  var category = await categories.find({}, {});
  res.render('show', {
    posts: blog,
    categories: category,
    moment:moment
  });
});   

router.get('/posts/show/', async function(req, res, next) {
  var blogs = db.get('posts');
  var categories = db.get('categories');
  var name = req.query.category;//ไปดึงค่าจาก query string category
  var author = req.query.author;   
  var title = req.query.title;   
  if(name){
    const blog = await blogs.find({category:name}, {});
    const category = await categories.find({}, {});
    res.render('show_search', {
      posts: blog,
      categories: category,
      moment:moment,
      search:name
    });
  }
  if(author){
    const blog = await blogs.find({author:author}, {});
    const category = await categories.find({}, {});
    res.render('show_search', {
      posts: blog,
      categories: category,
      moment:moment,
      search:author
    });
  }
  if(title){
    const blog = await blogs.find({title:title}, {});
    const category = await categories.find({}, {});
    res.render('show_search', {
      posts: blog,
      categories: category,
      moment:moment,
      search:title
    });
  }
});

router.get('/category/add', async function(req, res, next){
  res.render('addcategory')   
});

router.get('/post/add', async function(req, res, next) {
  var categories = db.get('categories');
  const category = await categories.find({}, {});
  res.render('addpost', {
    categories: category
  });
});

router.post('/category/add', [
  check('name', 'ชื่อประเภทต้องไม่เป็นค่าว่าง').not().isEmpty()
], async function(req, res, next) {
  var result = validationResult(req);
  var errors = result.errors;
  if (!result.isEmpty()) {
    res.render('addcategory', {
      errors: errors
    });
  } else {
    //บันทึกข้อมูลประเภท
    var category = db.get('categories');
    try {
      await category.insert({
        name: req.body.name
      });
      res.location('/');
      res.redirect('/');
    } catch (err) {
      res.send(err);
    }
  }
})   

router.post('/post/add', [
  check('title', 'กรุณาป้อนชื่อบทความ').not().isEmpty(),
  check('content', 'กรุณาป้อนเนื้อหา').not().isEmpty(),
  check('img', 'กรุณาใส่ภาพปก').not().isEmpty(),
  check('author', 'กรุณาป้อนชื่อผู้เขียน').not().isEmpty()
], async function(req, res, next) {
  var result = validationResult(req);
  var errors = result.errors;
  var categories = db.get('categories');
  var posts = db.get('posts');

  if (!result.isEmpty()) {
    const category = await categories.find({}, {});
    res.render('addpost', {
      categories: category,
      errors: errors
    });
  } else {
    // Insert Post
    await posts.insert({
      title: req.body.title,
      category: req.body.category,
      content: req.body.content,
      img: req.body.img,
      author: req.body.author,
      date: new Date()
    });
    try {
      res.location('/');
      res.redirect('/');
    } catch (err) {
      res.send(err);
    }
  }
});
module.exports = router;
  