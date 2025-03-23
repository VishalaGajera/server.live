import { supabase } from './supabaseClient';


const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [fileURL, setFileURL] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async () => {
        try {
            setUploading(true);
            if (!file) {
                alert("please select a file to upload.")
                return;
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { data, error } = await supabase.storage.form("E-Commerce").upload(filePath, file);

            if (error) {
                throw error;
            }

            const { data: url } = await supabase.storage.from("E-Commerce").getPublicUrl(filePath);
            setFileURL(url.publicUrl);
            alert("File Upload Successfully.");
        } catch (error) {
            console.log(error);
            alert("Error uploading file:", error.message)
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</button>
            {fileURL && (
                    <div>
                        <p>File Upload to : {fileURL}</p>
                        <img src={fileURL} alt="Uploaded file" style={{ width: "300px", height: "auto" }} />
                    </div>
                )
            }
        </>
    )
}