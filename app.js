const mongoose =  require("mongoose")
mongoose.connect("mongodb+srv://norda:anu@norda.2wt9rcv.mongodb.net/norda")
const express = require('express')
const app = express()
const session = require("express-session")
const path = require('path')



app.use(function (req, res, next) {
    res.set(
      "cache-control",
      "no-cache,private,no-store,must-revalidate,max-stale=0,pre-check=0"
    );
    next();
  });

app.use(session({secret:"hello",saveUninitialized:true,resave:true}))


app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));





app.use(express.static('public'))
app.use('/',express.static('public/user'))
app.use('/admin',express.static('public/admintemp'))




//to get the landing page
const userRouter = require('./routes/userRouter')
app.use('/',userRouter)

const adminRouter = require('./routes/adminRouter')
app.use('/admin',adminRouter)
app.use(function(req,res,next){
  res.status(404).render('404')
  next()
})




app.listen(3000,()=>{
   console.log("server started")
})
