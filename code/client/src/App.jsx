import { useState,useEffect } from 'react'
import './App.css'
import NavBar from './NavBar'
import DocSelection from './DocSelection';
import LoginForm from './loginForm';
import UploadDocs from './UploadDocs';

function App() {
  const [user, setUser] = useState(null);  
  const [userDocs, setUserDocs] = useState([]);


  useEffect(() => {
    const fetchUserDocs = async () => {
      if (!user){
        console.log("Not logged in yet");
        return;
      } 
        try {
          const res = await fetch('http://localhost:24086/userDocsQuery',{
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
      const res = await fetch('http://localhost:24086/userDocsQuery', {
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
      <NavBar></NavBar>
      <LoginForm setUser={setUser}></LoginForm>
      {user && (
        <>
          <DocSelection docs={userDocs} />

          <br></br>
          <UploadDocs refreshUserDocs={refreshUserDocs}/>
        </>
      )}
      <h1> Document Parse and Search</h1>
      
    </>
  )
}

export default App
