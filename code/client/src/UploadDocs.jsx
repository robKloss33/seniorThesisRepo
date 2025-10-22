
import { useState } from "react";


function UploadDocs({refreshUserDocs}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");

	const onFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};


  async function FileUpload(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData();

		formData.append(
			"myFile",
			selectedFile,
			selectedFile.name
		);

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
		<div>
			<h3>Upload New File</h3>
			<div>
				<input type="file" onChange={onFileChange} />
				<button onClick={FileUpload}>Upload!</button>
			</div>
			
		</div>
	);
  
}
  
export default UploadDocs;


//{fileData()}
