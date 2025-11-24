import { useState, useEffect } from 'react';

function LoginForm({ setUser }) {
    const [formType, setFormType] = useState("login"); 
    const [error, setError] = useState("");
    const [username, setUsername] = useState(null); 

    
    useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/userQuery', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.user) {
          setUsername(data.user);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    checkSession();
  }, [setUser]);

    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formUsername = form.username.value;
        const password = form.password.value;
        const email = form.email.value;
        console.log(formUsername,  password);

        const route = formType === "login" ? "/login" : "/register";
        console.log(route);
        try {
            const response = await fetch(`${route}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", 
                body: JSON.stringify({ username: formUsername, email, password }),
            });

            if (response.ok) {
                const userRes = await fetch('/userQuery', {
                    credentials: "include",
                });
                const userData = await userRes.json();
                console.log(userData.user)
                setUser(userData.user);
                setUsername(userData.user);
                setError("");
            } else {
                const errorText = await response.text();
                setError(errorText);
                setUsername(null);
                setUser(null);
            }
        } catch (err) {
            console.error("Network error:", err);
            setError("Server error, please try again.");
            setUsername(null);
            setUser(null)
        }

        form.reset();
    }
    async function handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                setUsername(null);
                setUser(null);
                setError("");
            } else {
                const errText = await response.text();
                setError("Logout failed: " + errText);
            }
        } catch (err) {
            console.error("Logout error:", err);
            setError("Server error during logout.");
        }
    }


    return (
        <>
            <div className="mb-3">
            {username !== null ? (
                <div className="alert alert-success d-flex justify-content-between align-items-center">
                    <span>Welcome <strong>{username}</strong></span>
                    <br></br>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input type="text" name="username" className="form-control" placeholder="Username" required />
                    </div>
                    <div className="form-group">
                        <input type="email" name="email" className="form-control" placeholder="Email" required />
                    </div>
                    
                    <div className="form-group">
                        <input type="password" name="password" className="form-control" placeholder="Password" required />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}
                    <br></br>
                    <p>
                        <button type="submit" className="btn btn-primary btn-block">
                            {formType === "login" ? "Login" : "Register"}
                        </button>
                    </p>
                    
                    <p>
                        <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => setFormType(formType === "login" ? "register" : "login")}
                    >
                        {formType === "login" ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>

                    </p>
                
                    
                </form>
            )}
        </div>
    </>
    )}



export default LoginForm;
