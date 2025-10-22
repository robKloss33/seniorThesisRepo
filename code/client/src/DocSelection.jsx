import { useState,useEffect } from 'react'
import './DocSelection.css'
function DocSelection({docs}) {
  const [error, setError] = useState("");
  const [phrases, setPhrases] = useState([]);
  const [report, setReport] = useState(null);


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
    console.log(data);
    let selectedDocs = [];
    formData.forEach((value, key) => {
      selectedDocs.push(key);
    });
    console.log(selectedDocs);
    selectedDocs = selectedDocs;

    console.log(selectedDocs);
    try {
        const response = await fetch(`http://localhost:24086/generateReport`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", 
            body: JSON.stringify({ keys: selectedDocs, searches: phrases}),
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

    form.reset();
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
        <div class="container">
          <div>
              <form onSubmit={addTerm}>
              <input type="text" placeholder="Search Phrase..." name="Phrase"/> 
              </form>

              <form onSubmit={clearTerms}>
              <input type="submit" value="Clear Terms"></input>
              </form>
          
              <form onSubmit={handleSubmit}>
              <br/>
              {docs.map(doc=> (
                <div key={doc.DocID}>
                  <input type ='checkbox' id= {doc.DocID}  name={doc.KeyName} value={doc.FileName}/>
                  <label htmlFor={doc.KeyName}> {doc.FileName} </label>
                  <br/>
                </div>
              ))}
              <input type="submit" value="Submit"></input>
              </form>
          </div>
          <div>
              {report && (
              <>
              <button onClick={handleDownload}> Download Report</button>
              <div className="report-container" dangerouslySetInnerHTML={{ __html: report }}/>
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
*/