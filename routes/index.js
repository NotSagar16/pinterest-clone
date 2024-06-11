var express = require('express');
var router = express.Router();
const userModel = require('./users')
const userPost = require('./posts')
const localStrategy = require('passport-local')
const passport = require('passport');
const upload = require('./multer')

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
  res.render('login',{error:req.flash('error')});
});
router.get("/feed", isLoggedIn, async function(req,res){
  const feed = await userPost.find({})
  res.render('feed',{feed})
});

router.post('/upload',isLoggedIn,upload.single('file'),async function(req,res,next){
  if(!req.file){
    return res.status(400).send("No files were uploaded")
  }
  const user = await userModel.findOne({username:req.session.passport.user});
  const postData=await userPost.create({
    image:req.file.filename,
    postText:req.body.filecaption,
    user:user._id
  })
  user.posts.push(postData._id)
  await user.save()
  res.redirect("/profile")
})

router.post('/register',function(req,res){
  var userData = new userModel({
    username:req.body.username, 
    email:req.body.email, 
    fullName:req.body.fullName,
    password:req.body.password,
  });
  userModel.register(userData,req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
      res.redirect('/profile')
    });
  });
})

router.post('/login', passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login",
  failureFlash:true,
}),function(req,res){});

router.get("/profile", isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  res.render('profile',{user})
});

router.get('/logout',function(req,res){
  req.logout(function(err){
    if(err){return err}
    res.redirect('/login')
  })
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect('/')
}
module.exports = router;
