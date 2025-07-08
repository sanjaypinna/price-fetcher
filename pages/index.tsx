"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PriceResult {
  link: string;
  price: number;
  currency: string;
  productName: string;
}

const countries = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "UK", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "UAE" },
];

export default function PriceComparisonTool() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query || !country) {
      setError("Please enter a product and select a country");
      return;
    }

    setResults([]);
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, country }),
      });

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  };
  console.log("results", results);
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search for Product</CardTitle>
            <CardDescription>
              Get price results from top sites using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="w-full flex gap-2 flex-col">
                <Label>Product</Label>
                <Input
                  placeholder="e.g. iPhone 16 Pro"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="w-full flex gap-2 flex-col">
                <Label>Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div
              className="flex justify-center"
              title="Enter the Product and Select Country"
            >
              <Button
                onClick={handleSearch}
                disabled={loading || !query || !country}
                className=" mx-auto bg-blue-500 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Searching...
                  </>
                ) : (
                  <>Search</>
                )}
              </Button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </CardContent>
        </Card>

        {loading ? (
          <div
            style={{
              animation: "blurUnblur 3s ease-in-out infinite",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              src="/loading.png"
              alt="Loading"
              width={500}
              height={500}
              unoptimized
            />

            <style jsx>{`
              @keyframes blurUnblur {
                0%,
                100% {
                  filter: blur(2px);
                }
                50% {
                  filter: blur(0px);
                }
              }
            `}</style>
          </div>
        ) : (
          results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              <div className="grid gap-4">
                {results.map((r, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{r.productName}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new URL(r.link).hostname}
                        </p>
                      </div>
                      <div className="text-right mt-4 md:mt-0">
                        <div className="text-green-600 font-bold text-xl">
                          {formatPrice(r.price, r.currency)}
                        </div>
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 flex items-center justify-end gap-1 mt-2"
                        >
                          View Deal <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
