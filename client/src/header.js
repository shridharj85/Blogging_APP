import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header(){
  //const [username,setUsername] = useState(null);
    const {setUserInfo,userInfo} = useContext(UserContext);
      useEffect(()=>{
        fetch('http://localhost:8000/profile',{
          credentials:'include',
        }).then(response=>{
          if(response.ok)
      {
        return response.json();
        
        
      }

      throw new Error('Something went wrong.');
          
        }).then(userInfo=>{
          setUserInfo(userInfo);
        })  
        .catch(err=>{
          console.log(err);
        })
      },[]);

      function logout(){
        fetch('http://localhost:8000/logout',{
          credentials:'include',
          method:'POST',
        })
        setUserInfo(null);
      }
      const username = userInfo?.username;
      return(
        <header>
        <Link to="/" className = "logo">Blog</Link>
        <nav>
          {username && (
            <>
            <Link to='/create' >create new Post</Link>
            <a onClick={logout}>logout </a>
            </>
          )}
          {!username && (
            <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
            </>

          )}

        </nav>
      </header>
    );
};