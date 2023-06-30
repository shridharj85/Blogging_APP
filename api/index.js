const express = require('express');
const app = express();

app.get('/test',(req,res)=>{
res.send("nothing");
})
app.listen(8000);