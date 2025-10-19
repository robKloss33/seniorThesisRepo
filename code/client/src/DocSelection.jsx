function DocSelection({docs}) {
    console.log(docs);
    return (
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
      );
  }
  
  export default DocSelection;