import { useState,useEffect } from 'react'
import './App.css'
import NavBar from './NavBar'
import LoginForm from './loginForm';

function App() {
  const [user, setUser] = useState(null);  
  const [userDocs, setUserDocs] = useState([]); 


  useEffect(() => {
    const fetchUserDocs = async () => {
      if (!user){
        console.log("Not logged in yet")
      } 
      else{
        try {
          const res = await fetch('http://localhost:24086/userDocsQuery',{
            credentials: "include",
            method: "GET"
          });
          if (res.ok) {
            console.log("here bro")
            const docs = await res.json();
            console.log(docs);
            setUserDocs(docs || []);
          } else {
            console.error('Error fetching Docs:', res.statusText);
          }
        } catch (error) {
          console.error('Error fetching Docs:', error);
        }
      }
      
    };
    fetchUserDocs();
  }, [user]);
  return (
    <>
      <NavBar></NavBar>
      <LoginForm setUser={setUser}></LoginForm>
      <h1> Document Parse and Search</h1>
      
    </>
  )
}

export default App
