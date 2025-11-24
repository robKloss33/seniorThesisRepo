import { useState,useEffect } from 'react'
import classes from './App.module.css'
import DocSelection from './DocSelection';
import LoginForm from './loginForm';
import UploadDocs from './UploadDocs';

function App() {
  const [user, setUser] = useState(null);  
  const [userDocs, setUserDocs] = useState([]);

  useEffect(() => {
  fetch("/userQuery", {
    credentials: "include"
  })
  .then(res => res.json())
  .then(data => {
    if (data.user) {
      setUser(data.user);
    }
  });
}, []);

  useEffect(() => {
    const fetchUserDocs = async () => {
      if (!user){
        console.log("Not logged in yet");
        return;
      } 
        try {
          const res = await fetch('/userDocsQuery',{
            credentials: "include",
            method: "GET"
          });
          if (res.ok) {
            let docs = await res.json();
            docs = docs.data;
            setUserDocs(docs[0] || []);

          } else {
            console.error('Error fetching Docs:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching Docs:', error);
        }
      
    };
    fetchUserDocs();
  }, [user]);


  const refreshUserDocs = async () => {
    try {
      const res = await fetch('/userDocsQuery', {
        credentials: "include",
        method: "GET"
      });
      if (res.ok) {
        let docs = await res.json();
        docs = docs.data;
        setUserDocs(docs[0] || []);
      } else {
        console.error('Error fetching updated user courses:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching updated user courses:', error);
    }
  };


  return (
    <>
      <div class= {classes.container}>
        <h1> Document Parse and Search</h1>
        
        <div><LoginForm setUser={setUser}></LoginForm></div>
        {user && (
        <>
          <div><UploadDocs refreshUserDocs={refreshUserDocs}/></div>
        </>)}
      </div>
      {user && (
        <>
          <DocSelection docs={userDocs} refreshUserDocs={refreshUserDocs} />

          <br></br>
          
        </>
      )}
      
      
    </>
  )
}

export default App
