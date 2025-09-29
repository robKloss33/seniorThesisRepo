import { useState } from 'react'
import './App.css'
import NavBar from './NavBar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <NavBar></NavBar>
      <h1> Document Parse and Search</h1>
      
    </>
  )
}

export default App
