const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./db/connect')
const user = require('./model/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
let salt =  bcrypt.genSaltSync(10);
const secret = 'ahksbvkaYvgbCBIWYVC78T19E5T';

app.post('/register',async (req,res)=>{
    try {
        const {username,password} = req.body;
        const userDB = await user.create({
            username,
            password:bcrypt.hashSync(password, salt)
        });
        res.status(200).json(userDB);
        
    } catch (error) {
        res.status(404).json(error);
        console.log('some error occured!!');
    }

})


app.post('/login',async(req,res)=>{
  const {username,password} = req.body;
  const userDoc = await user.findOne({username});
  const passOK = bcrypt.compareSync(password,userDoc.password);
  //res.json(passOK);
  if(passOK){
    //user logged in
    jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
      if(err) throw err;
      else{
        res.cookie('token', token).json('ok');
      }
    });
  }
  else{
    res.status(400).json({'wrong - Credentials':'password not matched'});
  }
})

app.get('/profile',(req,res)=>{
  const {token} = req.cookies;
  jwt.verify(token,secret,{},(err,info)=>{
    if(err)throw err;
    else{
      res.json(info);
    }
  })
  //res.json(req.cookies);
})



const port = process.env.PORT || 8080;
const start = async () => {
    try {
      await connectDB(process.env.MONGO_URI);
      app.listen(port, () =>
        console.log(`Server is listening on port ${port}...`)
      );
    } catch (error) {
      console.log(error);
    }
  };
//app.listen(8080);
start();