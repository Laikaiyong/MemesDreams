"use client";

import { useState } from "react";

export default function DeployContractButton() {
  const [uploading, setUploading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const handleUpload = () => {
    setUploading(true);
    setResponseMessage(""); // Clear previous messages

    // Fake delay of 5 seconds before showing success
    setTimeout(() => {
      setUploading(false);
      setResponseMessage("✅ Success: NFT uploaded and deployed!");
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-[#1C1C1C] text-white px-4 py-2 rounded-full hover:bg-[#3C3C3C] transition"
      >
        {uploading ? "Uploading..." : "Upload & Deploy"}
      </button>

      {/* Response Message */}
      {responseMessage && <p className="text-sm">{responseMessage}</p>}
    </div>
  );
}
