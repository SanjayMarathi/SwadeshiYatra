const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyA9dAdXYYq_umbVn0YC5DmIN-T29zWxRHM";

async function testAutocomplete() {
  const url = "https://places.googleapis.com/v1/places:autocomplete";
  const body = {
    input: "Jaipur",
    includedRegionCodes: ["in"],
    includedPrimaryTypes: ["locality"],
    languageCode: "en",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify(body),
  });
  console.log("Autocomplete Status:", res.status);
}

async function testWikimedia() {
  const placeTitle = "Taj Mahal";
  const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(placeTitle)}`;
  const res = await fetch(wikiUrl);
  const data = await res.json();
  console.log("Wikimedia Data:", JSON.stringify(data.query.pages, null, 2));
}

testAutocomplete();
testWikimedia();
