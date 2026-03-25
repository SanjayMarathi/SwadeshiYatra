const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyA9dAdXYYq_umbVn0YC5DmIN-T29zWxRHM";

async function testPlaces() {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.photos,places.displayName",
    },
    body: JSON.stringify({
      textQuery: "Taj Mahal, Agra",
      languageCode: "en",
      maxResultCount: 1,
    }),
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testPlaces();
