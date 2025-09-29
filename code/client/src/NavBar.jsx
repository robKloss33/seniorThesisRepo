import './NavBar.css'
function NavBar(){ 
    return ( 
        <>
        <div class="container">
            <div class="header">
            <a href="#default" class="logo">Document Parse and Search</a>
            <div class="header-right">
                <a class="active" href="#home">Home</a>
                <a href="#contact">Contact</a>
                <a href="#signin">Login/Register</a>
            </div>
            </div>
        </div>
        </>
    ); 
} 
 
export default NavBar;