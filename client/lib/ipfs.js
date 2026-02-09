import pinata from "./ipfs_config";

export const uploadFile = async (selectedFile) => {
  try {
    if (!selectedFile) {
      alert("Please select a file.");
      return null;
    }

    // Create FormData and append the selected file
    const formData = new FormData();
    formData.append("file", selectedFile);

    // Upload the file to IPFS using Pinata
    const uploadResponse = await pinata.upload.file(formData);
    console.log("File CID:", uploadResponse.IpfsHash);

    // Return the uploaded file CID
    return uploadResponse.IpfsHash;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};
