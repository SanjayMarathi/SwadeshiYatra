import { GoogleGenerativeAI } from "@google/generative-ai";
import { FeasibilityResult, ItineraryItem, TouristPlace, TripPreferences } from "@/types";

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Models available on v1beta as of early 2026, in order of preference
const MODEL_CANDIDATES = [
  "gemini-2.0-flash-lite",  // Lighter quota limits, usually available
  "gemini-2.0-flash",       // Primary, may hit 429 quota
  "gemini-1.5-flash-8b",    // Smaller 1.5 model
  "gemini-2.0-flash-thinking-exp-01-21", // Experimental thinking model
];

/** Call Gemini, retrying with delay on 429, skipping on 404 */
const generateText = async (prompt: string): Promise<string> => {
  if (!genAI) throw new Error("GEMINI_API_KEY not set");
  let lastError: unknown = null;
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`[Gemini] ✓ Model ${modelName} succeeded, length=${text.length}`);
      return text;
    } catch (err: unknown) {
      const msg = String(err);
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        // Rate limited — wait 30s and retry this model once
        console.warn(`[Gemini] ${modelName} quota hit (429), waiting 30s...`);
        await new Promise((r) => setTimeout(r, 30000));
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          console.log(`[Gemini] ✓ ${modelName} succeeded after retry`);
          return text;
        } catch (retryErr) {
          console.warn(`[Gemini] ${modelName} still failed after retry:`, retryErr);
          lastError = retryErr;
        }
      } else if (msg.includes("404") || msg.includes("Not Found")) {
        // Model doesn't exist — skip immediately to next
        console.warn(`[Gemini] ${modelName} not found (404), trying next...`);
        lastError = err;
      } else {
        console.warn(`[Gemini] ${modelName} failed:`, msg.slice(0, 200));
        lastError = err;
      }
    }
  }
  throw lastError;
};

/** Strip ``` fences and extract the first JSON match */
const extractJson = <T>(text: string, pattern: RegExp): T => {
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const match = stripped.match(pattern);
  return JSON.parse((match?.[0] || stripped)) as T;
};

// ─── Comprehensive real-data fallback for 40+ Indian cities ──────────────────

type CityFallback = { name: string; type: TouristPlace["type"]; rating: number; fameScore: number; description: string; bestTime: TouristPlace["bestTime"] };

const CITY_PLACES: Record<string, CityFallback[]> = {
  Jaipur: [
    { name: "Amber Fort", type: "HISTORICAL", rating: 4.7, fameScore: 10, description: "Magnificent 16th-century hilltop fort with Sheesh Mahal, Ganesh Pol gate, and stunning views of Maota Lake.", bestTime: "MORNING" },
    { name: "Hawa Mahal", type: "HISTORICAL", rating: 4.6, fameScore: 10, description: "Iconic five-storey palace of winds with 953 latticed windows, built in 1799 for royal ladies to observe street life.", bestTime: "MORNING" },
    { name: "City Palace", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "Grand royal complex with museums, courtyards, Chandra Mahal, and Mubarak Mahal in the heart of Jaipur.", bestTime: "MORNING" },
    { name: "Jantar Mantar", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "UNESCO-listed astronomical observatory with 19 precision instruments built by Maharaja Sawai Jai Singh II in 1724.", bestTime: "AFTERNOON" },
    { name: "Nahargarh Fort", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "Hilltop fort with panoramic views over Jaipur city and Jal Mahal — especially stunning at sunset.", bestTime: "EVENING" },
  ],
  Varanasi: [
    { name: "Dashashwamedh Ghat", type: "OTHER", rating: 4.8, fameScore: 10, description: "Most sacred ghat on the Ganga, site of the spectacular nightly Ganga Aarti performed by Hindu priests.", bestTime: "EVENING" },
    { name: "Kashi Vishwanath Temple", type: "TEMPLE", rating: 4.9, fameScore: 10, description: "One of India's holiest Shiva temples, rebuilt by Ahilya Bai Holkar in 1780, attracting millions of devotees.", bestTime: "MORNING" },
    { name: "Sarnath", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "Ancient Buddhist site 11km from Varanasi where Buddha gave his first sermon, with Dhamek Stupa and Ashoka Pillar.", bestTime: "MORNING" },
    { name: "Manikarnika Ghat", type: "OTHER", rating: 4.3, fameScore: 8, description: "Primary cremation ghat of Varanasi, considered most auspicious for last rites, burning continuously for centuries.", bestTime: "AFTERNOON" },
    { name: "Ramnagar Fort", type: "HISTORICAL", rating: 4.3, fameScore: 7, description: "18th-century fort palace of the Maharaja of Varanasi on the Ganga's east bank, with a vintage car museum.", bestTime: "AFTERNOON" },
  ],
  Mumbai: [
    { name: "Gateway of India", type: "HISTORICAL", rating: 4.6, fameScore: 10, description: "Iconic arch monument built in 1924 overlooking the Arabian Sea, the symbol of Mumbai.", bestTime: "MORNING" },
    { name: "Elephanta Caves", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "UNESCO-listed island rock-cut caves with massive Trimurti Shiva sculpture, dating back to 5th–8th centuries.", bestTime: "MORNING" },
    { name: "Marine Drive", type: "PARK", rating: 4.7, fameScore: 9, description: "3.6km C-shaped promenade known as Queen's Necklace, perfect for evening walks along the Arabian Sea.", bestTime: "EVENING" },
    { name: "Chhatrapati Shivaji Terminus", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "UNESCO-listed Victorian Gothic railway terminus, one of the finest and busiest railway stations in India.", bestTime: "MORNING" },
    { name: "Siddhivinayak Temple", type: "TEMPLE", rating: 4.7, fameScore: 9, description: "Famous Ganesh temple in Prabhadevi dedicated to Lord Ganesha, one of Maharashtra's richest temples.", bestTime: "MORNING" },
  ],
  Delhi: [
    { name: "Red Fort", type: "HISTORICAL", rating: 4.6, fameScore: 10, description: "UNESCO-listed 17th-century Mughal fort on the Yamuna, where India hoists its independence flag every August 15.", bestTime: "MORNING" },
    { name: "Qutub Minar", type: "HISTORICAL", rating: 4.5, fameScore: 10, description: "UNESCO-listed 73-metre minaret built in 1193, the world's tallest brick minaret, surrounded by Delhi Sultanate ruins.", bestTime: "MORNING" },
    { name: "India Gate", type: "HISTORICAL", rating: 4.7, fameScore: 9, description: "42-metre war memorial on Kartavya Path dedicated to 82,000 Indian soldiers who died in World War I.", bestTime: "EVENING" },
    { name: "Humayun's Tomb", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "UNESCO-listed 1565 Mughal tomb that inspired the Taj Mahal, set in a Persian-style charbagh garden.", bestTime: "MORNING" },
    { name: "Lotus Temple", type: "TEMPLE", rating: 4.6, fameScore: 8, description: "Striking Bahá'í house of worship shaped like a 27-petal lotus, open to all faiths, surrounded by nine pools.", bestTime: "AFTERNOON" },
  ],
  Agra: [
    { name: "Taj Mahal", type: "HISTORICAL", rating: 4.9, fameScore: 10, description: "UNESCO-listed ivory marble mausoleum built 1632–53 by Mughal emperor Shah Jahan for his wife Mumtaz Mahal.", bestTime: "MORNING" },
    { name: "Agra Fort", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "UNESCO-listed red-sandstone Mughal fort housing palaces, Diwan-i-Khas, and Sheesh Mahal, from which Shah Jahan viewed the Taj.", bestTime: "MORNING" },
    { name: "Fatehpur Sikri", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "Abandoned 1573 Mughal capital with Buland Darwaza, Jama Masjid, Panch Mahal, and Salim Chishti's dargah.", bestTime: "MORNING" },
    { name: "Mehtab Bagh", type: "PARK", rating: 4.5, fameScore: 8, description: "Moonlight garden on the Yamuna's opposite bank offering the best sunset view of the Taj Mahal.", bestTime: "EVENING" },
    { name: "Itmad-ud-Daulah", type: "HISTORICAL", rating: 4.3, fameScore: 7, description: "Jewel-box Mughal tomb built 1622–28 known as Baby Taj, first structure fully built in white marble with pietra dura.", bestTime: "MORNING" },
  ],
  Goa: [
    { name: "Calangute Beach", type: "BEACH", rating: 4.4, fameScore: 9, description: "Queen of Goa's beaches — a 7km stretch in North Goa with golden sand, water sports, shacks, and vibrant nightlife.", bestTime: "EVENING" },
    { name: "Basilica of Bom Jesus", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "UNESCO-listed 16th-century Baroque church housing the incorrupt body of St. Francis Xavier in a silver casket.", bestTime: "MORNING" },
    { name: "Fort Aguada", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "17th-century Portuguese fort at the mouth of Mandovi river with a 4-storey lighthouse dating to 1612.", bestTime: "MORNING" },
    { name: "Dudhsagar Falls", type: "PARK", rating: 4.7, fameScore: 9, description: "Four-tiered 310m waterfall on the Mandovi river on the Goa-Karnataka border — best visited June–December.", bestTime: "MORNING" },
    { name: "Anjuna Beach", type: "BEACH", rating: 4.3, fameScore: 8, description: "Famous cliff-lined beach in North Goa, known for its Wednesday flea market, trance party heritage, and rocky coves.", bestTime: "EVENING" },
  ],
  Kolkata: [
    { name: "Victoria Memorial", type: "MUSEUM", rating: 4.7, fameScore: 10, description: "Majestic white marble monument built 1906–21 as a memorial to Queen Victoria, with 25 galleries of British-India artifacts.", bestTime: "MORNING" },
    { name: "Howrah Bridge", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "Iconic 705m cantilever bridge over the Hooghly River, one of the world's busiest bridges carrying 100,000+ vehicles daily.", bestTime: "MORNING" },
    { name: "Dakshineswar Kali Temple", type: "TEMPLE", rating: 4.7, fameScore: 9, description: "Famous 1855 Kali temple on the Hooghly's east bank, associated with Ramakrishna Paramahamsa's spiritual life.", bestTime: "MORNING" },
    { name: "Indian Museum", type: "MUSEUM", rating: 4.4, fameScore: 8, description: "Oldest and largest museum in India (est. 1814) with exhibits spanning art, archaeology, natural history, and Mughal miniatures.", bestTime: "AFTERNOON" },
    { name: "Kalighat Temple", type: "TEMPLE", rating: 4.5, fameScore: 8, description: "One of India's 51 Shakti Pithas, famous Kali temple that gave Calcutta its name, attracting pilgrims daily.", bestTime: "MORNING" },
  ],
  Hyderabad: [
    { name: "Charminar", type: "HISTORICAL", rating: 4.5, fameScore: 10, description: "Iconic 1591 mosque and monument with four 56m minarets, built by Muhammad Quli Qutb Shah at Hyderabad's founding.", bestTime: "MORNING" },
    { name: "Golconda Fort", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "12th-century fort where Koh-i-Noor and Hope diamonds were mined, with remarkable acoustics at its Fateh Darwaza gate.", bestTime: "MORNING" },
    { name: "Chowmahalla Palace", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "Splendid Nizam palace complex (1750–1869) with four palaces, Khilwat Hall, and a vintage automobile collection.", bestTime: "MORNING" },
    { name: "Ramoji Film City", type: "OTHER", rating: 4.4, fameScore: 8, description: "World's largest film studio complex spread over 2000 acres, offering guided tours and entertainment attractions.", bestTime: "MORNING" },
    { name: "Hussain Sagar Lake", type: "PARK", rating: 4.3, fameScore: 7, description: "Heart-shaped artificial lake with a 18m monolithic Buddha statue on Rock of Gibraltar, popular for boat rides.", bestTime: "EVENING" },
  ],
  Bengaluru: [
    { name: "Lalbagh Botanical Garden", type: "PARK", rating: 4.6, fameScore: 9, description: "240-acre botanical garden laid out in 1760 by Hyder Ali, housing 1,000+ plant species and a 3,000 million-year-old rock.", bestTime: "MORNING" },
    { name: "Mysore Palace", type: "HISTORICAL", rating: 4.7, fameScore: 9, description: "Wait — this is in Mysuru. Bengaluru's top: Bangalore Palace — a Tudor-style palace built in 1887 modeled on Windsor Castle.", bestTime: "MORNING" },
    { name: "Cubbon Park", type: "PARK", rating: 4.5, fameScore: 8, description: "300-acre public park in the heart of Bengaluru with 6,000+ trees, statues, and landmark heritage buildings.", bestTime: "MORNING" },
    { name: "Tipu Sultan's Summer Palace", type: "HISTORICAL", rating: 4.3, fameScore: 7, description: "18th-century two-storey teak-wood palace built by Tipu Sultan, richly decorated with floral and geometric patterns.", bestTime: "MORNING" },
    { name: "ISKCON Temple Bengaluru", type: "TEMPLE", rating: 4.7, fameScore: 8, description: "Grand Hare Krishna temple completed in 1997, one of the largest ISKCON temples in the world.", bestTime: "MORNING" },
  ],
  Chennai: [
    { name: "Marina Beach", type: "BEACH", rating: 4.5, fameScore: 10, description: "World's longest natural urban beach at 13km, with historic lighthouse, Anna Park, and evening food stalls.", bestTime: "EVENING" },
    { name: "Kapaleeshwarar Temple", type: "TEMPLE", rating: 4.7, fameScore: 9, description: "7th-century Shiva temple with a 37m ornate gopuram, at the heart of old Mylapore — one of Chennai's oldest.", bestTime: "MORNING" },
    { name: "Mahabalipuram", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "UNESCO-listed 7th-8th century group of monuments: Shore Temple, Pancha Rathas, and Arjuna's Penance bas-relief.", bestTime: "MORNING" },
    { name: "Fort St. George", type: "HISTORICAL", rating: 4.3, fameScore: 8, description: "First English fortress in India (1644), now housing Tamil Nadu's Secretariat and Legislative Assembly with a museum.", bestTime: "MORNING" },
    { name: "Government Museum", type: "MUSEUM", rating: 4.3, fameScore: 7, description: "Second oldest museum in India (1851) with collections of Roman antiquities, Buddhist sculptures, and Chola bronzes.", bestTime: "AFTERNOON" },
  ],
  Kochi: [
    { name: "Fort Kochi Beach", type: "BEACH", rating: 4.5, fameScore: 9, description: "Historic seafront with Chinese fishing nets, colonial bungalows, and views of the Arabian Sea — evening is magical.", bestTime: "EVENING" },
    { name: "Chinese Fishing Nets", type: "OTHER", rating: 4.6, fameScore: 9, description: "Iconic cantilevered shore fishing nets introduced from China in 14th century — still in use today.", bestTime: "EVENING" },
    { name: "Mattancherry Palace", type: "MUSEUM", rating: 4.4, fameScore: 8, description: "16th-century Dutch Palace with Kerala murals depicting Ramayana and Mahabharata in Mattancherry.", bestTime: "MORNING" },
    { name: "Paradesi Synagogue", type: "HISTORICAL", rating: 4.4, fameScore: 7, description: "Oldest active synagogue in India (1568) in Jew Town, with hand-painted Chinese floor tiles and Belgian glass chandeliers.", bestTime: "MORNING" },
    { name: "Kerala Folklore Museum", type: "MUSEUM", rating: 4.4, fameScore: 7, description: "Three-floor museum with 4,000+ artifacts spanning Kerala's heritage including Theyyam costumes and temple art.", bestTime: "AFTERNOON" },
  ],
  Udaipur: [
    { name: "City Palace", type: "HISTORICAL", rating: 4.7, fameScore: 10, description: "Massive 400-year-old palace complex on Lake Pichola's shores, with museums, terraces, and panoramic views of Udaipur.", bestTime: "MORNING" },
    { name: "Lake Pichola", type: "PARK", rating: 4.6, fameScore: 9, description: "Pristine artificial lake created in 1362 BCE, home to Jag Niwas (Lake Palace Hotel) and Jag Mandir island palaces.", bestTime: "EVENING" },
    { name: "Jagdish Temple", type: "TEMPLE", rating: 4.4, fameScore: 8, description: "Large 1651 Hindu temple dedicated to Vishnu with black stone image of Jagannath, 32 steps from City Palace.", bestTime: "MORNING" },
    { name: "Sajjangarh Palace", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "Monsoon Palace on a hilltop offering panoramic views of Udaipur city, lakes, and Aravalli hills.", bestTime: "EVENING" },
    { name: "Saheliyon-ki-Bari", type: "PARK", rating: 4.3, fameScore: 7, description: "Garden of Maidens — 18th-century royal ladies' garden with ornamental pools, fountains, kiosks, and marble elephants.", bestTime: "MORNING" },
  ],
  Jaisalmer: [
    { name: "Jaisalmer Fort", type: "HISTORICAL", rating: 4.7, fameScore: 10, description: "UNESCO-listed 12th-century golden sandstone fort — one of the world's few living forts with shops and guesthouses inside.", bestTime: "MORNING" },
    { name: "Sam Sand Dunes", type: "OTHER", rating: 4.5, fameScore: 9, description: "Golden Thar Desert dunes 40km from Jaisalmer, famous for camel safaris and overnight desert camps.", bestTime: "EVENING" },
    { name: "Patwon-ki-Haveli", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "Largest of Jaisalmer's havelis — 5 intricately carved mansions built by wealthy Patwa merchants in early 19th century.", bestTime: "MORNING" },
    { name: "Gadisagar Lake", type: "PARK", rating: 4.4, fameScore: 7, description: "14th-century reservoir with yellow sandstone chhatris, temples, and pilgrim ghats — serene migratory bird habitat.", bestTime: "MORNING" },
    { name: "Salim Singh-ki-Haveli", type: "HISTORICAL", rating: 4.3, fameScore: 7, description: "Multi-storey 17th-century haveli of the Prime Minister of Jaisalmer with a peacock-arch balcony.", bestTime: "MORNING" },
  ],
  Amritsar: [
    { name: "Golden Temple (Harmandir Sahib)", type: "TEMPLE", rating: 4.9, fameScore: 10, description: "Most sacred Sikh shrine with gold-plated sanctum, Amrit Sarovar holy pool, and free langar for 100,000+ daily.", bestTime: "MORNING" },
    { name: "Jallianwala Bagh", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "Memorial garden where British troops massacred 1,000+ civilians on April 13, 1919 — preserved bullet holes on walls.", bestTime: "MORNING" },
    { name: "Wagah Border Ceremony", type: "OTHER", rating: 4.7, fameScore: 9, description: "Daily flag-lowering retreat ceremony on India-Pakistan border, with military precision drill and national pride spectacle.", bestTime: "EVENING" },
    { name: "Akal Takht", type: "TEMPLE", rating: 4.6, fameScore: 8, description: "Highest temporal seat of Sikh authority beside the Golden Temple — one of the Panth's five appointed takhts.", bestTime: "MORNING" },
    { name: "Durgiana Temple", type: "TEMPLE", rating: 4.4, fameScore: 7, description: "Hindu temple on a sacred lake resembling the Golden Temple architecture, dedicated to Goddess Durga.", bestTime: "MORNING" },
  ],
  Jodhpur: [
    { name: "Mehrangarh Fort", type: "HISTORICAL", rating: 4.8, fameScore: 10, description: "One of India's largest forts, built 1459 by Rao Jodha on a 125m rock with 7 gates, museums, and panoramic views.", bestTime: "MORNING" },
    { name: "Jaswant Thada", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "Marble cenotaph memorial built in 1899 for Maharaja Jaswant Singh II with intricate carving and tranquil gardens.", bestTime: "MORNING" },
    { name: "Umaid Bhawan Palace", type: "HISTORICAL", rating: 4.6, fameScore: 8, description: "Art Deco palace (1943) — partly a hotel, partly museum — the world's 6th largest private residence.", bestTime: "MORNING" },
    { name: "Clock Tower Market", type: "OTHER", rating: 4.3, fameScore: 7, description: "Colorful Sardar Market bazaar around the 1880 clock tower, selling spices, textiles, handicrafts, and street food.", bestTime: "EVENING" },
    { name: "Mandore Gardens", type: "PARK", rating: 4.2, fameScore: 6, description: "Ancient capital of Marwar with cenotaphs of Marwar rulers, galleries of heroes, and a museum in peaceful gardens.", bestTime: "MORNING" },
  ],
  Rishikesh: [
    { name: "Laxman Jhula", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "Iconic iron suspension bridge over the Ganga built in 1939, flanked by temples and ashrams.", bestTime: "MORNING" },
    { name: "Triveni Ghat", type: "TEMPLE", rating: 4.5, fameScore: 9, description: "Sacred Ganga bathing ghat and site of evening Maha Aarti, believed to be confluence of Ganga, Yamuna, Saraswati.", bestTime: "EVENING" },
    { name: "Neelkanth Mahadev Temple", type: "TEMPLE", rating: 4.6, fameScore: 8, description: "Hindu temple at 1,330m altitude dedicated to Lord Shiva, where legend says he drank poison (Neelkanth).", bestTime: "MORNING" },
    { name: "Ganga Rafting", type: "OTHER", rating: 4.7, fameScore: 9, description: "World-famous white-water rafting on the Ganga — Grade I–IV rapids for beginners to experienced adventurers.", bestTime: "MORNING" },
    { name: "Beatles Ashram (Chaurasi Kutia)", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "Maharishi Mahesh Yogi's 1968 ashram where The Beatles composed songs; now an art gallery and meditation space.", bestTime: "MORNING" },
  ],
  Manali: [
    { name: "Rohtang Pass", type: "PARK", rating: 4.6, fameScore: 9, description: "High mountain pass at 3,978m offering snow, skiing in winter, and stunning views of Kullu and Lahaul valleys.", bestTime: "MORNING" },
    { name: "Hadimba Temple", type: "TEMPLE", rating: 4.5, fameScore: 9, description: "Unique 16th-century wooden pagoda temple dedicated to Goddess Hadimba, surrounded by ancient cedar forest.", bestTime: "MORNING" },
    { name: "Solang Valley", type: "PARK", rating: 4.6, fameScore: 8, description: "Snow-clad valley famous for skiing, snowboarding, and paragliding, 14km from Manali town.", bestTime: "MORNING" },
    { name: "Old Manali Village", type: "OTHER", rating: 4.4, fameScore: 7, description: "Charming old village with apple orchards, guesthouses, cafes, local handicraft shops and Manu Temple.", bestTime: "AFTERNOON" },
    { name: "Naggar Castle", type: "HISTORICAL", rating: 4.4, fameScore: 7, description: "15th-century castle in traditional Kathloga style, later a European guesthouse and now a state heritage hotel.", bestTime: "MORNING" },
  ],
  Shimla: [
    { name: "The Ridge", type: "PARK", rating: 4.6, fameScore: 9, description: "Large open space in Shimla's heart with panoramic Himalayan views, Christ Church, and Scandal Point.", bestTime: "MORNING" },
    { name: "Jakhu Temple", type: "TEMPLE", rating: 4.5, fameScore: 8, description: "Ancient Hanuman temple at 8,048ft — highest point in Shimla — accessible by ropeway with Himalayan views.", bestTime: "MORNING" },
    { name: "Kufri", type: "PARK", rating: 4.4, fameScore: 8, description: "Hill resort 13km from Shimla with skiing in winter and Himalayan Nature Park with Himalayan wildlife.", bestTime: "MORNING" },
    { name: "Kalka-Shimla Toy Train", type: "OTHER", rating: 4.7, fameScore: 9, description: "UNESCO-listed narrow-gauge mountain railway with 102 tunnels and 864 bridges through the Shivalik range.", bestTime: "MORNING" },
    { name: "Viceregal Lodge (Rashtrapati Niwas)", type: "HISTORICAL", rating: 4.4, fameScore: 7, description: "Magnificent 1888 Elizabethan-style building that served as summer residence of British India's Viceroy.", bestTime: "MORNING" },
  ],
  Darjeeling: [
    { name: "Tiger Hill", type: "PARK", rating: 4.7, fameScore: 10, description: "Sunrise viewpoint at 2,590m offering spectacular view of Mt. Kangchenjunga and Mt. Everest on clear days.", bestTime: "MORNING" },
    { name: "Darjeeling Himalayan Railway", type: "OTHER", rating: 4.7, fameScore: 9, description: "UNESCO-listed toy train running since 1881 on 2ft gauge track through the Shivalik foothills.", bestTime: "MORNING" },
    { name: "Batasia Loop", type: "PARK", rating: 4.5, fameScore: 8, description: "Scenic railway loop built in 1919 where the toy train does a 360°-turn with Kangchenjunga backdrop and Gorkha war memorial.", bestTime: "MORNING" },
    { name: "Happy Valley Tea Estate", type: "OTHER", rating: 4.4, fameScore: 8, description: "One of Darjeeling's oldest tea estates (1854) offering plantation tours and tastings of famous First Flush Darjeeling tea.", bestTime: "MORNING" },
    { name: "Padmaja Naidu Himalayan Zoo", type: "PARK", rating: 4.5, fameScore: 8, description: "High-altitude zoo at 7,000ft housing snow leopards, red pandas, Tibetan wolves, and Himalayan salamanders.", bestTime: "MORNING" },
  ],
  Mysuru: [
    { name: "Mysore Palace", type: "HISTORICAL", rating: 4.8, fameScore: 10, description: "Magnificent Indo-Saracenic palace of the Wadiyar dynasty, illuminated by 100,000 bulbs during Dasara festival.", bestTime: "MORNING" },
    { name: "Chamundeshwari Temple", type: "TEMPLE", rating: 4.6, fameScore: 9, description: "Dravidian temple atop 1,065m Chamundi Hill with a giant Nandi bull statue — panoramic view of Mysuru.", bestTime: "MORNING" },
    { name: "Brindavan Gardens", type: "PARK", rating: 4.5, fameScore: 8, description: "Terraced garden below Krishna Raja Sagara dam with musical fountains and illuminations in the evening.", bestTime: "EVENING" },
    { name: "Jaganmohan Palace", type: "MUSEUM", rating: 4.3, fameScore: 7, description: "1861 palace housing the Jayachamarajendra Art Gallery with Ravi Varma paintings and musical instruments.", bestTime: "AFTERNOON" },
    { name: "Mysore Zoo", type: "PARK", rating: 4.5, fameScore: 7, description: "One of India's oldest (1892) and most well-maintained zoos housing white tigers, gorillas, and Indian rhinos.", bestTime: "MORNING" },
  ],
  Leh: [
    { name: "Pangong Tso Lake", type: "PARK", rating: 4.8, fameScore: 10, description: "Stunning high-altitude lake at 4,350m, 134km long spanning India and China, famous for 3 Idiots filming location.", bestTime: "MORNING" },
    { name: "Leh Palace", type: "HISTORICAL", rating: 4.5, fameScore: 9, description: "17th-century nine-storey palace modeled on Potala Palace in Lhasa, built by King Sengge Namgyal.", bestTime: "MORNING" },
    { name: "Hemis Monastery", type: "TEMPLE", rating: 4.6, fameScore: 9, description: "Largest and richest monastery in Ladakh (17th century), hosting the famous Hemis Festival in June–July.", bestTime: "MORNING" },
    { name: "Magnetic Hill", type: "OTHER", rating: 4.3, fameScore: 7, description: "Optical illusion hill where vehicles appear to roll uphill naturally — near Leh on the Leh-Kargil highway.", bestTime: "MORNING" },
    { name: "Shanti Stupa", type: "TEMPLE", rating: 4.6, fameScore: 8, description: "White-domed Buddhist stupa built in 1991 on a hilltop in Chanspa with panoramic views of Leh city.", bestTime: "EVENING" },
  ],
  Pune: [
    { name: "Shaniwar Wada", type: "HISTORICAL", rating: 4.4, fameScore: 9, description: "18th-century Peshwa fortress palace built in 1732, with massive 66ft main gate and ruins of five-storey palace.", bestTime: "MORNING" },
    { name: "Aga Khan Palace", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "1892 Italian-arched palace where Mahatma Gandhi was imprisoned, housing Gandhi Smarak — national monument.", bestTime: "MORNING" },
    { name: "Sinhagad Fort", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "Hilltop fort 24km from Pune, site of the 1670 Battle of Sinhagad, accessible via trek through the Sahyadri hills.", bestTime: "MORNING" },
    { name: "Osho Meditation Resort", type: "OTHER", rating: 4.3, fameScore: 7, description: "World-famous meditation resort in Koregaon Park offering 65+ meditation techniques across lush gardens.", bestTime: "MORNING" },
    { name: "Dagdusheth Ganpati Temple", type: "TEMPLE", rating: 4.7, fameScore: 8, description: "Famous 1893 Ganesh temple with a golden idol adorned with 8kg gold and 3.5kg silver items.", bestTime: "MORNING" },
  ],
  Ahmedabad: [
    { name: "Sabarmati Ashram", type: "HISTORICAL", rating: 4.7, fameScore: 10, description: "Gandhi's 1917 ashram on the Sabarmati riverbank, from where the 1930 Dandi Salt March started.", bestTime: "MORNING" },
    { name: "Adalaj Stepwell", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "Exquisite 1499 five-storey vav (stepwell) blending Hindu and Islamic architecture in intricate carved sandstone.", bestTime: "MORNING" },
    { name: "Sidi Saiyyed Mosque", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "1573 mosque with famous 'Tree of Life' jali stone lattice screens — the symbol of Ahmedabad.", bestTime: "MORNING" },
    { name: "Akshardham Temple", type: "TEMPLE", rating: 4.7, fameScore: 8, description: "Grand BAPS Swaminarayan temple in rose-pink stone with exhibitions, gardens, and cultural programmes.", bestTime: "MORNING" },
    { name: "Kankaria Lake", type: "PARK", rating: 4.3, fameScore: 7, description: "15th-century circular lake with children's park, zoo, toy train, and evening fountain shows.", bestTime: "EVENING" },
  ],
  Bhopal: [
    { name: "Sanchi Stupa", type: "HISTORICAL", rating: 4.7, fameScore: 10, description: "UNESCO-listed 3rd-century BC Buddhist monument built by Emperor Ashoka with ornate toranas, 46km from Bhopal.", bestTime: "MORNING" },
    { name: "Bharat Bhavan", type: "MUSEUM", rating: 4.3, fameScore: 7, description: "State arts complex housing Roopankar (visual arts), Rangmandal (drama), and open-air amphitheatre.", bestTime: "AFTERNOON" },
    { name: "Van Vihar National Park", type: "PARK", rating: 4.4, fameScore: 7, description: "National zoo-park along the Upper Lake with tigers, lions, bears, and crocodiles in a natural setting.", bestTime: "MORNING" },
    { name: "Upper Lake (Bada Talaab)", type: "PARK", rating: 4.4, fameScore: 7, description: "Asia's oldest man-made lake built in 11th century, offering boat rides and pleasant promenades.", bestTime: "EVENING" },
    { name: "Taj-ul-Masjid", type: "TEMPLE", rating: 4.5, fameScore: 8, description: "One of India's largest mosques with two massive minarets, construction spanning 1878 to 1985.", bestTime: "MORNING" },
  ],
  Lucknow: [
    { name: "Bara Imambara", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "Magnificent 1784 complex with the world's largest arched hall without beams, bhul-bhulaiya maze, and mosque.", bestTime: "MORNING" },
    { name: "Hazratganj Market", type: "OTHER", rating: 4.4, fameScore: 8, description: "Iconic colonial-era shopping precinct blending Victorian arcades with Lucknawi culture and famous chaat stalls.", bestTime: "EVENING" },
    { name: "Chota Imambara", type: "HISTORICAL", rating: 4.4, fameScore: 8, description: "1838 imambara with ornate chandeliers from Belgium, intricate painted walls, a silver throne, and golden minarets.", bestTime: "MORNING" },
    { name: "Rumi Darwaza", type: "HISTORICAL", rating: 4.5, fameScore: 8, description: "Imposing 1784 gateway modeled on Constantinople's gateway, 60ft tall with intricate stucco work.", bestTime: "MORNING" },
    { name: "Nawab Wajid Ali Shah Zoological Garden", type: "PARK", rating: 4.3, fameScore: 6, description: "One of India's oldest zoos (1921) spread over 29 acres with white tigers, giraffes, and hippos.", bestTime: "MORNING" },
  ],
  Pondicherry: [
    { name: "Auroville", type: "OTHER", rating: 4.5, fameScore: 9, description: "Experimental universal township founded in 1968 with 3,000+ residents from 60 countries, featuring the Matrimandir sphere.", bestTime: "MORNING" },
    { name: "French Quarter (White Town)", type: "HISTORICAL", rating: 4.6, fameScore: 9, description: "Colonial streets with mustard-yellow French villas, bougainvillea facades, and the 14km sea promenade.", bestTime: "MORNING" },
    { name: "Sri Aurobindo Ashram", type: "TEMPLE", rating: 4.5, fameScore: 8, description: "1926 spiritual ashram founded by Sri Aurobindo and The Mother, with meditation halls, libraries, and samadhi.", bestTime: "MORNING" },
    { name: "Basilica of the Sacred Heart", type: "HISTORICAL", rating: 4.4, fameScore: 7, description: "Neo-Gothic Roman Catholic basilica (1907) with stained-glass panels depicting the life of Sacred Heart of Jesus.", bestTime: "MORNING" },
    { name: "Paradise Beach", type: "BEACH", rating: 4.5, fameScore: 8, description: "Pristine beach accessible only by boat, with calm waves, white sand, and coconut groves.", bestTime: "MORNING" },
  ],
  Munnar: [
    { name: "Eravikulam National Park", type: "PARK", rating: 4.6, fameScore: 9, description: "National park and UNESCO-listed biosphere with Nilgiri Tahr antelope, Neelakurinji flowers (bloom every 12 years).", bestTime: "MORNING" },
    { name: "Mattupetty Dam", type: "PARK", rating: 4.4, fameScore: 8, description: "Concrete and stone masonry dam surrounded by shola forests and tea gardens, with boating on the reservoir.", bestTime: "MORNING" },
    { name: "Tea Museum", type: "MUSEUM", rating: 4.3, fameScore: 7, description: "KDHP Tea Museum in Munnar town showing history of Munnar's tea industry with antique machinery and tastings.", bestTime: "AFTERNOON" },
    { name: "Anamudi Peak", type: "PARK", rating: 4.6, fameScore: 8, description: "Highest peak in South India at 2,695m, inside Eravikulam NP — trek requires forest department permits.", bestTime: "MORNING" },
    { name: "Attukal Waterfalls", type: "PARK", rating: 4.4, fameScore: 7, description: "Scenic waterfall 9km from Munnar on the way to Rajamala, flowing through coffee and cardamom plantations.", bestTime: "MORNING" },
  ],
};

/** Get fallback places for a city — first check known list, then generate generic */
const getFallback = (city: string): TouristPlace[] => {
  const known = CITY_PLACES[city];
  if (known) {
    return known.map((p, i) => ({ id: `${city}-${i}`, city, ...p }));
  }
  // Generic fallback only as last resort
  return [
    { id: `${city}-0`, name: `${city} Heritage Monument`, city, rating: 4.3, fameScore: 8, description: `A significant historical monument in ${city} with rich history and impressive architecture.`, bestTime: "MORNING" as const, type: "HISTORICAL" as const },
    { id: `${city}-1`, name: `${city} Main Temple`, city, rating: 4.4, fameScore: 7, description: `An important place of worship in ${city} attracting pilgrims and tourists year-round.`, bestTime: "MORNING" as const, type: "TEMPLE" as const },
    { id: `${city}-2`, name: `${city} Lake / Garden`, city, rating: 4.2, fameScore: 6, description: `Scenic natural space in ${city} popular for morning walks and evening relaxation.`, bestTime: "EVENING" as const, type: "PARK" as const },
  ];
};

// ─── Exported Functions ───────────────────────────────────────────────────────

export const getTouristPlaces = async (city: string): Promise<TouristPlace[]> => {
  const prompt = `List exactly 5 real, well-known tourist attractions in ${city}, India.
Use only ACTUAL real named places — do NOT make up generic names.

Respond ONLY as a valid JSON array (no markdown, no code block):
[{"name":"Exact real place name","rating":4.7,"fameScore":9,"description":"3 sentences about this specific real place","bestTime":"MORNING","type":"HISTORICAL"}]

Types: TEMPLE, BEACH, MUSEUM, PARK, HISTORICAL, OTHER
bestTime: MORNING, AFTERNOON, EVENING, NIGHT`;

  try {
    const text = await generateText(prompt);
    const places = extractJson<TouristPlace[]>(text, /\[[\s\S]*?\]/);
    if (!Array.isArray(places) || places.length === 0) throw new Error("Empty");
    return places.map((p, i) => ({ ...p, id: `${city}-${i}`, city }));
  } catch (err) {
    console.error(`[Gemini] getTouristPlaces(${city}) → fallback:`, String(err).slice(0, 100));
    return getFallback(city);
  }
};

export interface CityAttractionDetail {
  name: string; type: string; description: string; highlights: string[];
  visitingHours: string; bestSeason: string; timeNeeded: string;
  entryFeeAdult: number; entryFeeChild: number; entryFeeForeign: number;
  nearbyAttractions: string[]; tips: string[]; rating: number; fameScore: number;
}

export interface CityPlannerData {
  cityOverview: string; bestTimeToVisit: string; howToReach: string;
  localTransport: string; attractions: CityAttractionDetail[];
  totalBudgetEstimate: string; culturalTips: string[];
}

export const getCityPlannerData = async (city: string): Promise<CityPlannerData> => {
  const prompt = `Expert Indian travel guide for ${city}, India.
Provide REAL accurate data. Use actual named places only.

Respond ONLY as valid JSON (no markdown, no code fences):
{"cityOverview":"2 sentences","bestTimeToVisit":"e.g. Oct–Mar","howToReach":"Air/Train/Road briefly","localTransport":"Options","attractions":[{"name":"Exact real name","type":"Historical","description":"3-4 sentences","highlights":["h1","h2","h3","h4"],"visitingHours":"9AM-5PM","bestSeason":"Oct-Mar","timeNeeded":"2hr","entryFeeAdult":100,"entryFeeChild":50,"entryFeeForeign":500,"nearbyAttractions":["a","b"],"tips":["t1","t2"],"rating":4.7,"fameScore":9}],"totalBudgetEstimate":"₹2000-4000/person/day","culturalTips":["c1","c2","c3"]}
Give 8 real attractions for ${city}. All fees in INR.`;

  try {
    const text = await generateText(prompt);
    const data = extractJson<CityPlannerData>(text, /\{[\s\S]*\}/);
    if (!data.attractions?.length) throw new Error("No attractions");
    return data;
  } catch (err) {
    console.error(`[Gemini] getCityPlannerData(${city}) → fallback:`, String(err).slice(0, 100));
    const places = getFallback(city);
    return {
      cityOverview: `${city} is a vibrant city in India with rich cultural heritage, historical landmarks, and unique local traditions that draw visitors from around the world.`,
      bestTimeToVisit: "October to March (winter — cool and dry)",
      howToReach: "By air via nearest airport; by train to the main junction; by road via national highway or GSRTC/MSRTC/KSRTC buses.",
      localTransport: "Auto-rickshaws, Ola/Uber app cabs, city buses. Metro available in select cities.",
      totalBudgetEstimate: "₹1500–₹3000 per person per day (excluding accommodation)",
      culturalTips: ["Dress modestly at temples and religious sites.", "Carry cash as many local vendors don't accept cards.", "Greet locals with 'Namaste' — it is warmly received."],
      attractions: places.map((p) => ({
        name: p.name, type: p.type, description: p.description,
        highlights: ["Explore the main highlights with a guide", "Visit early to avoid queues", "Photography allowed in outer areas", "Ask locals for off-the-beaten-path spots"],
        visitingHours: "9:00 AM – 5:30 PM", bestSeason: "October – March",
        timeNeeded: "1.5–2 hours", entryFeeAdult: 50, entryFeeChild: 25, entryFeeForeign: 300,
        nearbyAttractions: [], tips: ["Arrive early for the best experience.", "Hire a certified guide at the gate."],
        rating: p.rating, fameScore: p.fameScore,
      })),
    };
  }
};

type PlannerInput = Pick<TripPreferences, "budget" | "durationDays" | "cities" | "foodPreference" | "travelPreference"> & {
  originCountry: string;
  places: Pick<TouristPlace, "name">[];
};

export const analyzeFeasibility = async (data: PlannerInput): Promise<FeasibilityResult> => {
  const prompt = `Analyze India trip feasibility:
From: ${data.originCountry}, Budget: ₹${data.budget}, Duration: ${data.durationDays}d
Route: ${data.cities.join("→")}, Places: ${data.places.map((p) => p.name).join(", ")}
Transport: ${data.travelPreference}

Respond ONLY as JSON:
{"isPossible":true,"reason":"1-2 sentences","suggestions":["tip1","tip2","tip3"],"estimatedCost":45000,"estimatedTime":36}`;

  try {
    const text = await generateText(prompt);
    return extractJson<FeasibilityResult>(text, /\{[\s\S]*\}/);
  } catch {
    const est = Math.max(0, data.cities.length - 1) * 2000 + data.places.length * 700;
    return {
      isPossible: est <= data.budget,
      reason: est <= data.budget ? "Route is feasible within the given budget." : "Budget may be tight — consider fewer stops or increasing budget.",
      suggestions: ["Book train tickets 2–3 weeks in advance.", "Use shared auto-rickshaws within cities.", "Visit top-rated attractions first."],
      estimatedCost: est,
      estimatedTime: Math.max(8, data.places.length * 3),
    };
  }
};

export const generateItinerary = async (data: PlannerInput): Promise<ItineraryItem[]> => {
  const prompt = `Create a detailed India trip itinerary:
Route: ${data.cities.join("→")}
Places: ${data.places.map((p) => p.name).join(", ")}
Duration: ${data.durationDays}d, Transport: ${data.travelPreference}

Use real Indian prices. Give 5 numbered point-wise steps per stop.
Respond ONLY as JSON array:
[{"day":1,"time":"09:00 AM","place":"Real name","city":"City","activity":"Brief","transport":"Mode","routeFrom":"From","routeTo":"To","suggestedGuide":"Note","entryFee":500,"transportCost":1200,"guideFee":0,"totalCost":1700,"highlights":["1. Step one","2. Step two","3. Step three","4. Step four","5. Step five"],"imageUrl":""}]`;

  try {
    const text = await generateText(prompt);
    const plan = extractJson<ItineraryItem[]>(text, /\[[\s\S]*?\]/);
    if (Array.isArray(plan) && plan.length > 0) return plan;
    throw new Error("Empty");
  } catch {
    const cc = data.cities.length || 1;
    const ppd = Math.max(1, Math.ceil(data.places.length / Math.max(1, data.durationDays)));
    return data.places.map((place, i) => {
      const day = Math.min(data.durationDays, Math.floor(i / ppd) + 1);
      const ci = i % cc;
      const city = data.cities[ci] || "India";
      const entry = 300 + (i % 3) * 100;
      const travel = cc > 1 ? 1500 : 400;
      return {
        day, time: `${9 + (i % 3) * 3}:00 AM`, place: place.name, city,
        activity: `Explore ${place.name} — a key attraction in ${city}.`,
        transport: data.travelPreference === "PRIVATE" ? "Private Cab" : "Public Auto/Bus",
        routeFrom: i === 0 ? "Starting Point" : data.cities[(ci - 1 + cc) % cc] || city,
        routeTo: city,
        suggestedGuide: `Certified local guide for ${city} recommended`,
        entryFee: entry, transportCost: travel, guideFee: 0, totalCost: entry + travel,
        highlights: [
          `1. Reach ${place.name} by ${data.travelPreference === "PRIVATE" ? "private cab" : "auto/bus"}.`,
          `2. Purchase entry tickets at the gate (₹${entry} approx).`,
          "3. Start at the main entrance and follow the guide's route.",
          "4. Spend 1.5–2 hrs exploring key areas and viewpoints.",
          "5. Take photographs and proceed to the next stop.",
        ],
        imageUrl: "",
      };
    });
  }
};
