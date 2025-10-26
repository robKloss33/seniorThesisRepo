
import { useState, useRef} from "react";


function UploadDocs({refreshUserDocs}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

	const onFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

  function checkValid(keyName, size){
    if(keyName.endsWith('.pdf') || keyName.endsWith('.docx') || keyName.endsWith('.xlsx') || keyName.endsWith('.pptx') || keyName.endsWith('.txt'))
    {
        if(size <= 5)
        {
          return true;
        }
    }
    return false;
  } 



  async function FileUpload(event) {
    event.preventDefault();

    const form = event.target;
    let formData = new FormData();

		formData.append(
			"myFile",
			selectedFile,
			selectedFile.name
		);
    const fileSize = selectedFile.size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    if(!checkValid(selectedFile.name, fileSizeMB))
    {
      console.error("Network error: Invalid File");
      setError("File must be pdf, docx, xlsx, pptx, txt and <= 5mb");
      return;
    }

    console.log(selectedFile);
    try {
        const response = await fetch(`http://localhost:24086/upload`, {
            method: "POST",
            credentials: "include", 
            body: formData,
        });

        if (response.ok) {
            await refreshUserDocs();
            setSelectedFile(null);
            setMessage("Uploaded Doc");

        } else {
            const errorText = await response.text();
            setError(errorText);
            setMessage(errorText);
        }
    } catch (err) {
        console.error("Network error:", err);
        setError("Server error, please try again.");
    }
    }

	return (
		<div>
			<h3>Upload New File</h3>
			<div>
				<input type="file" onChange={onFileChange} />
				<button onClick={FileUpload}>Upload!</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
			</div>
			
		</div>
	);
  
}
  
export default UploadDocs;


//{fileData()}
