import { useState } from "react";

export default function DeployContractButton({ name, symbol, image }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDeploy = async () => {
        console.log("Deploying NFT with:", "name:", name, "symbol:", symbol, "image:", image);
        if (!name || !symbol || !image) {
            setError("Missing NFT data");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("action", "deployNFT");
        formData.append("name", name);
        formData.append("symbol", symbol);
        formData.append("image", image);

        try {
            const response = await fetch("/api/deploy", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert(`NFT deployed! Contract address: ${data.contractAddress}`);
            } else {
                throw new Error(data.error || "Unknown error");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div className="text-red-500">{error}</div>}
            <button
                onClick={handleDeploy}
                className="text-background bg-foreground px-4 py-2 rounded-lg hover:bg-[#3b3b3b]"
                disabled={loading}
            >
                {loading ? "Deploying..." : "Deploy NFT"}
            </button>
        </div>
    );
}