import { useEffect, useState } from "react";
import Post from "../post";
export default function IndexPage(){
    const [posts,setPosts] = useState([]);
    useEffect(()=>{
        fetch(`http://localhost:8000/post`)
        .then(response=>{
            response.json().then(posts=>{
                setPosts(posts);
            })
        }).catch(err=>{
            console.log("post retrieval failed");
        })
    },[])
return( 
    <>
    {posts.length>0 && posts.map((post,index)=>(
        
        <Post key={index} {...post}/>
    ))}
    </>
);
}