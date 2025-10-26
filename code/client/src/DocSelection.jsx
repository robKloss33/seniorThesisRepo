import { useState,useEffect } from 'react'
import classes from './DocSelection.module.css'
function DocSelection({docs, refreshUserDocs}) {
  const [error, setError] = useState("");
  const [phrases, setPhrases] = useState([]);
  const [report, setReport] = useState(null);
  const [formType, setFormType] = useState("search"); 


  async function addTerm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formPhrase = formData.get("Phrase");
    setPhrases(prev => [...prev, formPhrase]);
    form.reset();
  }

  async function clearTerms(event) {
    event.preventDefault();;
    setPhrases([]);
  }

  useEffect(() => {
    console.log("Updated phrases:", phrases);
  }, [phrases]);


  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const data = form.entries;

    let selectedDocs = [];
    formData.forEach((value, key) => {
      selectedDocs.push(key);
    });
    selectedDocs = selectedDocs;

    console.log(selectedDocs);
    if(formType === 'search')
    {
      await handleSearch(selectedDocs, phrases);
    }
    else{
      await handleDelete(selectedDocs);
    }
    setPhrases([]);


    form.reset();
    }


    async function handleSearch(keys, phrases) {
      try {
        const response = await fetch(`http://localhost:24086/generateReport`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
            body: JSON.stringify({ keys: keys, searches: phrases}),
        });
        if (response.ok) {
            let res = await response.json();
            setReport(res.html);
        } else {
            const errorText = await response.text();
            setError(errorText);
        }
      } catch (err) {
          console.error("Network error:", err);
          setError("Server error, please try again.");
      }
      
    }

    async function handleDelete(keys) {
      console.log(keys);
      try {
          const response = await fetch(`http://localhost:24086/removeDoc`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              credentials: "include", 
              body: JSON.stringify({ keys: keys}),
          });
          if (response.ok) {
              await refreshUserDocs();
          } else {
              const errorText = await response.text();
              setError(errorText);
          }
      } catch (err) {
          console.error("Network error:", err);
          setError("Server error, please try again.");
      }
    }


    async function handleDownload(event) {
      event.preventDefault();

      console.log(report);

      try {
          const response = await fetch(`http://localhost:24086/generateDoc`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              credentials: "include", 
              body: JSON.stringify({ html: report}),
          });
          if (response.ok) {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "report.docx";
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
          } else {
              const errorText = await response.text();
              setError(errorText);
          }
      } catch (err) {
          console.error("Network error:", err);
          setError("Server error, please try again.");
      }
      }


    return (
      <>
        <div className={classes.container}>
          <div>
              
              <div className={classes.box}>
                <div className={classes.halfcontainer}>
                  <p>
                    <form onSubmit={addTerm}>
                      <input type="text" placeholder="Search Phrase..." name="Phrase"/> 
                    </form>
                  </p>
                  <p>
                    <form onSubmit={clearTerms}>
                      <button className={classes.clearButton}type="submit">
                          Clear Terms
                      </button>
                    </form>
                  </p> 
                </div>

                <h2>Search Terms</h2>
                <p>{phrases.length === 0 ? "No terms yet"  : phrases.join(", ")} </p>


              </div>
              



              
              <form onSubmit={handleSubmit}>
               <div className={classes.box}>
              <div className={classes.halfcontainer}>
                  <p>
                    <button type="submit" className="btn btn-primary btn-block">
                          {formType === "search" ? "Search" : "Delete"}
                    </button>
                  </p>
                  <p>
                    <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => setFormType(formType === "search" ? "delete" : "search")}>

                          {formType === "search" ? "Switch to document removal" : "Switch to document search"}
                    </button>
                  </p>
              </div>
              </div>
              
              <br/>
              {docs.map(doc=> (
                <div key={doc.DocID}>
                  <input type ='checkbox' id= {doc.DocID}  name={doc.KeyName} value={doc.FileName} className={classes.input}/>
                  <label htmlFor={doc.KeyName}> {doc.FileName} </label>
                  <br/>
                </div>

              ))}
              </form>
          </div>
          <div>
              {report && (
              <>
              <button onClick={handleDownload}> Download Report</button>
              <div dangerouslySetInnerHTML={{ __html: report }}/>
              </>
              )}
          </div>
        </div>

      </>
      
      );
  }
  
  export default DocSelection;

  /*
  
   <table id="CourseTable">
          <thead>
            <tr><th>Course Code</th><th>Course Name</th><th>Location</th><th>Exam Time</th></tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.DocID}>
                <td>{doc.DocID}</td>
                <td>{doc.KeyName}</td>
                <td>{doc.FileName}</td>
                <td>{doc.UserID}</td>
              </tr>
            ))}
          </tbody>
        </table>


    <input type="submit" value="Submit"></input>
*/