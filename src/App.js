import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [type, setType] = useState("legacy");
  const [result, setResult] = useState(null);
  const [generationType, setGenerationType] = useState("withoutSeed");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      if (generationType === "withSeed") {
        if (!seedPhrase.trim()) {
          setErrorMessage("Seed phrase is required.");
          return;
        } else {
          setErrorMessage("");
        }

        const response = await axios.post(
          "http://localhost:5000/generateAddress",
          {
            seedPhrase: seedPhrase,
            type: type,
          }
        );
        console.log(response.data); // Verify response
        await setResult(response.data);
        setLoading(false);
      } else {
        const response = await axios.post(
          "http://localhost:5000/generateNewAddresses"
        );
        console.log(response.data); // Verify response
        await setResult(response.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching addresses", error);
    }
  };

  const handleGenerationTypeChange = (newType) => {
    setGenerationType(newType);
    setSeedPhrase("");
    setType("legacy");
    setResult(null);
    setErrorMessage("");
  };

  return (
    <div className="App">
      <h1>Bitcoin Address Generator</h1>
      <div className="options">
        <label>
          <input
            type="radio"
            value="withSeed"
            checked={generationType === "withSeed"}
            onChange={() => handleGenerationTypeChange("withSeed")}
          />
          Generate with Seed Phrase and Type
        </label>
        <label>
          <input
            type="radio"
            value="withoutSeed"
            checked={generationType === "withoutSeed"}
            onChange={() => handleGenerationTypeChange("withoutSeed")}
          />
          Generate without Seed Phrase and Type
        </label>
      </div>
      {generationType === "withSeed" && (
        <div className="input-container">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Seed Phrase"
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
            />
            {errorMessage && (
              <span className="error-message">{errorMessage}</span>
            )}
          </div>
          <div className="input-group">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="legacy">Legacy</option>
              <option value="segwit">SegWit</option>
              <option value="nestedSegwit">Nested SegWit</option>
              <option value="taproot">Taproot</option>
            </select>
          </div>
        </div>
      )}
      <button
        onClick={fetchAddresses}
        className="generate-button"
        disabled={loading}
      >
        {loading ? "Loading..." : "Generate Addresses"}
      </button>
      {result && (
        <div className="result">
          {generationType === "withSeed" ? (
            <>
              <div className="address-group">
                <span>
                  <strong>Address:</strong>
                </span>
                <span className="address">{result.address}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(result.address)}
                >
                  Copy
                </button>
              </div>
              <div className="address-group">
                <span>
                  <strong>Private Key:</strong>
                </span>
                <span className="private-key">{result.privateKey}</span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(result.privateKey)
                  }
                >
                  Copy
                </button>
              </div>
              <div className="address-group">
                <img
                  src={result.qrcode}
                  className="qr-code"
                  alt={`${type} QR Code`}
                />
              </div>
            </>
          ) : (
            <>
              <div className="address-group">
                <span>
                  <strong>Mnemonic:</strong>
                </span>
                <span className="mnemonic">{result.mnemonic}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(result.mnemonic)}
                >
                  Copy
                </button>
              </div>
              <div className="address-group">
                <span>
                  <strong>Private Key:</strong>
                </span>
                <span className="private-key">{result.privateKey}</span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(result.privateKey)
                  }
                >
                  Copy
                </button>
              </div>
              <div className="grid-container-2x2">
                {Object.keys(result.addresses).map((addressType) => (
                  <div key={addressType} className="grid-item">
                    <div className="address-group flex-col">
                      <span>
                        <strong>
                          {addressType.charAt(0).toUpperCase() +
                            addressType.slice(1)}{" "}
                          Address:
                        </strong>
                      </span>
                      <span className="address">
                        {result.addresses[addressType]}
                      </span>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            result.addresses[addressType]
                          )
                        }
                      >
                        Copy
                      </button>
                      <div>
                        <img
                          src={
                            result.qrcodes ? result.qrcodes[addressType] : ""
                          }
                          alt={`${addressType} QR Code`}
                          className="qr-code"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
