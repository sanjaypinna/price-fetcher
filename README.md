# 🛍️ Global Price Comparison Tool

A smart, AI-powered tool that fetches product prices from top e-commerce websites across the world based on country and search query. Uses **Gemini API** for e-commerce site discovery and **SerpAPI + JSON-LD** scraping for accurate price extraction.


---

🎥 [Click to watch the demo](https://drive.google.com/file/d/1nJiwF_qW2FM3QC3ABAMNWR4f5qLFHEYw/view?usp=sharing)


---

## 🚀 Features

- 🔍 Search any product in any supported country
- 🌐 Automatically fetches top e-commerce sites using Gemini
- 🤖 Extracts product price, currency, and metadata using SerpAPI + JSON-LD
- 🎯 Includes fallback handling for rate limits and quota
- 🧩 Includes accessories (e.g., cases) and main products
- 🧠 Scalable architecture with support for multiple API keys

---

## 🛠️ Tech Stack

- **Next.js** (API + UI)
- **TypeScript**
- **Gemini (Google Generative Language API)**
- **SerpAPI (Google Search API)**
- **Axios**, **Cheerio**
- **Tailwind + ShadCN** (for UI)

---

## 📦 Setup Instructions

1. Clone the repo
2. Add the following in your `.env.local`:

```env
GEMINI_API_KEY=your_key
SERP_API_KEY=your_key
