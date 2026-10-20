// i18n-ready copy (Hungarian primary). Add an `en` object with the same shape later.
export const services = [
  { n: "01", title: "Websites & Digital Experiences", hu: "Weboldalak és digitális élmények", text: "Prémium, gyors, egyedi weboldalak, amelyek eladnak és emlékezetesek.", items: ["Márkaoldalak", "Landing page-ek", "Interaktív 3D élmények", "Helyi SEO"] },
  { n: "02", title: "Apps & Custom Software", hu: "Alkalmazások és egyedi szoftverek", text: "Mobil- és webalkalmazások ötlettől működő termékig.", items: ["Product design", "Mobilalkalmazás", "Webapp", "Előfizetéses modellek"] },
  { n: "03", title: "AI Automation & AI Agents", hu: "AI automatizáció és ügynökök", text: "Ismétlődő munkák kiváltása intelligens folyamatokkal.", items: ["AI asszisztensek", "Dokumentumfeldolgozás", "Workflow automatizáció", "Integrációk"] },
  { n: "04", title: "Internal Business Systems", hu: "Belső üzleti rendszerek", text: "Foglalás, admin, CRM — a működésedre szabva.", items: ["Foglalási rendszerek", "Admin felületek", "Dashboardok", "Jogosultságkezelés"] },
  { n: "05", title: "Brand & Creative Design", hu: "Márka és kreatív design", text: "Karakteres vizuális identitás, ami kitűnik.", items: ["Arculat", "UI rendszer", "Art direction", "Motion"] },
  { n: "06", title: "Strategy & Digital Growth", hu: "Stratégia és digitális növekedés", text: "Üzleti és marketing szemlélet minden döntés mögött.", items: ["Pozicionálás", "Konverzió", "Ügyfélút", "Mérés"] },
];

export const process = [
  { n: "01", t: "Megértés", d: "Az üzleted, a célod és az ügyfeleid. Előbb kérdezek, aztán tervezek." },
  { n: "02", t: "Stratégia", d: "Mit építünk, miért, és hogyan méri majd a siker." },
  { n: "03", t: "Design", d: "Egyedi vizuális irány és felhasználói élmény, sablonok nélkül." },
  { n: "04", t: "Fejlesztés", d: "Gyors, stabil, bővíthető technológia." },
  { n: "05", t: "Indulás és növekedés", d: "Élesítés után is ott vagyok: mérés, finomítás, bővítés." },
];

export const contact = {
  // Placeholder — replace with real contact details.
  email: "hello@gatailab.hu",
  location: "Budapest, Hungary",
};

// Home: "Képzeld el" — one day with a system that works while you don't.
export const imagine = [
  { time: "07:12", icon: "system", title: "Kávé mellett látod: éjjel tizennégy foglalás jött be.", text: "Egyiket sem te vetted fel. A naptár kész, az emlékeztetők kimentek." },
  { time: "09:40", icon: "ai", title: "Az AI-asszisztens már válaszolt a reggeli kérdésekre.", text: "Udvariasan, pontosan, a te hangodon — és csak azt adja tovább, amihez tényleg te kellesz." },
  { time: "13:05", icon: "app", title: "Az ajánlatkérés magától a helyére került.", text: "Besorolva, összefoglalva, határidővel a CRM-ben. Neked csak igent kell mondanod." },
  { time: "18:30", icon: "growth", title: "A dashboard megmutatja, mi hozta a mai ügyfeleket.", text: "Nem érzésre döntesz, hanem adatból — egyetlen képernyőn." },
  { time: "23:59", icon: "brand", title: "Te alszol. A rendszer dolgozik.", text: "Ez nem a jövő. Ez egy jól megtervezett vállalkozás." },
] as const;

// Home: "Ötlet → rendszer" — the modules an idea can grow into.
export const ideaModules = [
  { id: "web", label: "Weboldal", pitch: "Gyors, karakteres felület, ami első látásra bizalmat épít és ügyfelet hoz.", nudge: "Egy jó landing oldal már a megnyitás napján méri, honnan jönnek az érdeklődők.", keywords: ["weboldal", "honlap", "landing", "oldal", "bemutat", "portfolio", "marka", "arculat", "seo"] },
  { id: "app", label: "Mobil- vagy webapp", pitch: "Saját alkalmazás, amit az ügyfeleid nap mint nap használnak.", nudge: "Egy saját app hűségprogrammal visszahozza azokat is, akik egyszer már vásároltak.", keywords: ["app", "alkalmazas", "mobil", "platform", "kozosseg", "felhasznalo", "hűseg", "huseg", "elofizet", "tagsag"] },
  { id: "booking", label: "Foglalás és naptár", pitch: "Éjjel-nappal foglalható időpontok, ütközés és telefonálgatás nélkül.", nudge: "Az online foglalás mellé automatikus emlékeztető: kevesebb elmaradt időpont.", keywords: ["foglal", "idopont", "naptar", "asztal", "szalon", "fodrasz", "barber", "rendelo", "edzes", "terem", "szallas"] },
  { id: "shop", label: "Webshop és fizetés", pitch: "Online értékesítés, kártyás fizetés, előfizetés vagy jegy — egy rendszerben.", nudge: "Az előfizetéses modell kiszámítható havi bevételt csinál az egyszeri vásárlásból.", keywords: ["webshop", "bolt", "termek", "fizet", "rendeles", "kosar", "jegy", "ertekesit", "kartya"] },
  { id: "ai", label: "AI-asszisztens", pitch: "Válaszol, ajánl, összefoglal — a te tudásodból, a te stílusodban.", nudge: "Egy AI-asszisztens a leggyakoribb kérdések nagy részét megválaszolja, mielőtt felvennéd a telefont.", keywords: ["ai", "chat", "asszisztens", "ugyfelszolgalat", "valaszol", "gpt", "ugynok", "intelligens", "ajanl", "bot"] },
  { id: "automation", label: "Automatizált folyamatok", pitch: "Ami ismétlődik, az magától fut: e-mailek, értesítések, számlák, riportok.", nudge: "Ami ma egy órányi kézi munka, az automatizálva percek alatt lefut — miközben te mással foglalkozol.", keywords: ["automat", "email", "e-mail", "ertesit", "szamla", "workflow", "folyamat", "adminisztracio", "papir", "kezi", "excel", "tablazat"] },
  { id: "crm", label: "Admin és CRM", pitch: "Minden ügyfél, ajánlat és feladat egy helyen, a te működésedre szabva.", nudge: "Egy egyszerű CRM-mel egyetlen ajánlatkérés sem vész el a postafiókban.", keywords: ["crm", "admin", "ugyfel", "ajanlat", "lead", "nyilvantart", "belso", "keszlet", "csapat", "munkatars"] },
  { id: "data", label: "Dashboard és mérés", pitch: "Élő számok egy képernyőn: mi működik, mi nem, merre tovább.", nudge: "Egy dashboard megmutatja, melyik csatorna hozza a legjobb ügyfeleket — és hova ne költs többet.", keywords: ["dashboard", "kimutatas", "meres", "statisztik", "adat", "riport", "noveked", "elemz", "kpi"] },
  { id: "docs", label: "Dokumentumfeldolgozás", pitch: "Szerződések, számlák, PDF-ek — beolvasva, kivonatolva, rendszerezve.", nudge: "Az AI percek alatt kiolvassa a lényeget a beérkező dokumentumokból.", keywords: ["dokumentum", "pdf", "szerzodes", "irat", "beolvas", "konyvel", "ajanlatkeres"] },
] as const;

export const ideaPresets = [
  "Időpontfoglalás és AI-válaszok a szalonomnak",
  "AI ügyfélszolgálat a webshopomhoz",
  "CRM az ajánlatkéréseinkhez, automatikus e-mailekkel",
  "Közösségi app előfizetéssel és dashboarddal",
] as const;
