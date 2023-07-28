const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const connectDB = require('./db/connect')
const Post  = require('./model/post');
const user = require('./model/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({dest:'uploads/'});
const fs = require('fs');

app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
// console.log(__dirname);
app.use('/uploads',express.static(__dirname+'/uploads'))

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
  try{
  const userDoc = await user.findOne({username});
 
  const passOK =  bcrypt.compareSync(password,userDoc.password);
  //res.json(passOK);
  //console.log(userDoc);
  if(passOK ){
    //user logged in
    jwt.sign({username,id:userDoc._id},secret,{},(err,token)=>{
      if(err) throw err;
      else{
        res.cookie('token', token).json({
          id:userDoc._id,
          username
        });
      }
    });
  }
  else{
    res.status(400).json({'wrong - Credentials':'password not matched'});
  }
}
catch(err){
  res.status(400).json({'wrong - Credentials':'username not matched'});
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


app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok');
})

app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
  const {originalname,path} = req.file;

  const parts = originalname.split('.');
  const ext =parts[parts.length-1];
  const newPath = path+'.'+ext;
  fs.renameSync(path,newPath);
  const {token} = req.cookies;
  
  jwt.verify(token,secret,{},async (err,info)=>{
    if(err)throw err;
    else{const {title,summary,content} = req.body;
    const PostDoc = await Post.create({
     title,
     summary,
     content,
     cover:newPath,
     author:info.id,
   })
      res.json(PostDoc);
      
    }
  })
  
  


})

app.get('/post',async (req,res)=>{
  res.json( await Post.find().populate('author',['username'])
  .sort({createdAt:-1})
  .limit(20)
  )

  
  
})

app.get('/post/:id',async (req,res)=>{
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author',['username']);
  res.json(postDoc);
})

app.put('/post',uploadMiddleware.single('file'),async(req,res)=>{
 let newPath=null;
  if(req.file){
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext =parts[parts.length-1];
     newPath = path+'.'+ext;  
    fs.renameSync(path,newPath);
  }
  
  const {token} = req.cookies;
  
  jwt.verify(token,secret,{},async (err,info)=>{
    if(err)throw err;
    const {id,title,summary,content} = req.body;
    const postDoc = await Post.findById(id);
    
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    //res.json({isAuthor});
    if(!isAuthor){
      return res.status(400).json('you are not the author');
      
    } 
    const result = await Post.updateOne(
      {_id:id},
      {title:title,
        summary:summary,
        content:content,
        cover: newPath ? newPath : postDoc.cover,
        
      }
    )
    res.json(result);
    
    
    
    
})
})



const port = process.env.PORT || 8000;
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