// /api/price-compare.ts
import axios from "axios";

const SERP_KEY = process.env.SERP_API_KEY1;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    console.warn("⛔ Invalid method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, country } = req.body;
  if (!query || !country) {
    console.warn("⚠ Missing query or country", req.body);
    return res.status(400).json({ error: "Missing query or country" });
  }

  console.log("🔍 Starting price comparison for", { query, country });

  try {
    const sites = await getSitesForCountry(country);
    console.log("✅ Fetched top sites:", sites);

    const results = [];

    for (const site of sites) {
      console.log("🌐 Searching site:", site);
      const links = await searchWithSerpAPI(query, site);
      console.log(`🔗 Found ${links.length} links from ${site}`);

      for (const link of links) {
        console.log("📦 Extracting data from", link);
        const metadata = await extractMetadata(link);
        if (metadata) {
          console.log("✅ Extracted metadata:", metadata);
          results.push(metadata);
        } else {
          console.warn("⚠ No metadata found for", link);
        }
      }
    }

    console.log("🎯 Final results count:", results.length);
    return res.status(200).json({ results });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}


// --- Get top sites from Gemini ---
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY1,
  process.env.GEMINI_API_KEY2,
];

async function getSitesForCountry(country) {
  const prompt = `List 5 top e-commerce domains in ${country} for electronics and fashion (e.g., amazon.in). Return only plain domain names, one per line.`;

  for (const key of GEMINI_KEYS) {
    try {
      const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const raw = resp.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return raw
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d.includes("."))
        .slice(0, 5);
    } catch (err) {
      console.warn(
        `⚠ Gemini key failed (${key}):`,
        err.response?.status || err.message
      );

      if (err.response?.status === 503 || err.response?.status === 429) {
        continue; // fallback to next key
      } else {
        throw err; // other errors like 401 (invalid key), stop retrying
      }
    }
  }

  throw new Error("All Gemini keys exhausted or failed (503/429).");
}

// --- Search Google via SerpAPI ---
async function searchWithSerpAPI(query, site) {
  try {
    const resp = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: `${query} site:${site}`,
        api_key: SERP_KEY,
      },
    });

    return (
      resp.data.organic_results
        ?.map((r) => r.link)
        .filter(Boolean)
        .slice(0, 5) || []
    );
  } catch (err) {
    console.warn("❌ SerpAPI error:", err.message);
    return [];
  }
}

// --- Extract structured data using JSON-LD ---
async function extractMetadata(url) {
  try {
    const html = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Referer: "https://www.google.com/",
        DNT: "1", // Do Not Track
        Connection: "keep-alive",
      },
    });

    const matches = html.data.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs
    );
    if (!matches) return null;

    for (const match of matches) {
      const jsonRaw = match.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];
      try {
        const json = JSON.parse(jsonRaw);
        const product = Array.isArray(json)
          ? json.find((j) => j["@type"] === "Product")
          : json;

        if (product?.name && product?.offers?.price) {
          return {
            productName: product.name,
            price: parseFloat(product.offers.price),
            currency: product.offers.priceCurrency || "USD",
            link: url,
            parameter1: product.brand?.name || product.sku || null,
          };
        }
      } catch {
        continue; // Try next block
      }
    }

    return null;
  } catch (err) {
    console.warn("❌ Extract failed for", url, err.message);
    return null;
  }
}
