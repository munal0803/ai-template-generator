import React, { useState, useRef } from "react";
import { createBrochure } from "./api";
import ReactMarkdown from "react-markdown";
import "github-markdown-css"; // npm install github-markdown-css
import jsPDF from "jspdf";    // npm install jspdf
import html2canvas from "html2canvas"; // npm install html2canvas

export default function App() {
  const [companyName, setCompanyName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markdown, setMarkdown] = useState("");

  // Ref for the rendered markdown we’ll capture
  const brochureRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMarkdown("");

    if (!companyName || !siteUrl) {
      setError("⚠️ Please fill both fields");
      return;
    }

    try {
      setLoading(true);
      const data = await createBrochure(companyName, siteUrl);
      setMarkdown(data.markdown || "");
    } catch (err) {
      setError(err.message || "❌ Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      alert("✅ Markdown copied!");
    } catch {
      alert("❌ Failed to copy");
    }
  };

  // Create a styled PDF (captures the rendered markdown as it appears)
  const saveAsPDF = async () => {
    if (!brochureRef.current) return;

    // Ensure the element has a white background so the PDF isn’t dark/transparent
    const node = brochureRef.current;

    try {
      const canvas = await html2canvas(node, {
        scale: 2,                 // sharper output
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        // If images from other domains cause errors, uncomment the next line to skip them:
        // ignoreElements: (el) => el.tagName === "IMG",
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Scale image to full page width
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${companyName || "brochure"}.pdf`);
    } catch (e) {
      alert("❌ Error generating PDF: " + e.message);
      // If you see a CORS/tainted canvas error, try enabling the ignoreElements for IMG above.
    }
  };

  return (
    <div className="container" style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1>📄 Company Brochure Generator</h1>
        <p style={{ color: "gray" }}>
          Backend: <code>{import.meta.env.VITE_API_BASE_URL}</code>
        </p>
      </header>

      <form onSubmit={onSubmit} className="card" style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          Company Name
          <input
            type="text"
            placeholder="e.g. Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          Website URL
          <input
            type="url"
            placeholder="https://example.com"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "⏳ Generating…" : "🚀 Generate Brochure"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}

      {markdown && (
        <div className="card">
          <div className="actions" style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
            <button
              onClick={copyMarkdown}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              📋 Copy Markdown
            </button>
            <button
              onClick={saveAsPDF}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              💾 Save as PDF
            </button>
          </div>

          {/* This is what we capture for PDF */}
          <article
            ref={brochureRef}
            className="markdown-body"
            style={{
              background: "white",
              color: "#111",
              padding: "1.5rem",
              borderRadius: "8px",
            }}
          >
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </article>
        </div>
      )}
    </div>
  );
}
