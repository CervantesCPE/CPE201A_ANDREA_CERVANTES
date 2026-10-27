"use strict";
       
    /* =========================================
           fil
        ========================================= */


        const i18n = {
    fil: {
        notice: "ⓘ PAMBAHANG IMPORMASYON NG NCR  · Hindi opisyal na serbisyong pambabala",
        brand_sub: "PAMBAHANG IMPORMASYON NG NCR",
        profile: "Aking Profile",
        babawHeroTitle: "Alamin ang panahon. Maghanda sa pagbaha.",
        babawHeroSub: "Iexplore ang panahon, mga lokasyon ayon sa mga lungsod sa NCR, minodelong impormasyon ukol sa ilog, at mga pinagkakatiwalaang sanggunian tungkol sa baha mula sa gobyerno sa isang madaling gamiting dashboard.",
        overview: "Iexplore ang dashboard",
        map: "Tignan ang interaktib na mapa",
        disclaimer: "Akademikong prototipo · Hindi opisyal na serbisyong pambabala",

        nav_overview: "Overview",
        nav_map: "Mapa",
        nav_rivers: "Antas ng ilog",
        nav_weather: "Kalagayan ng panahon",
        nav_sources: "Mga mapagkukunan",
        nav_about: "About",
        nav_hotlines: "Hotline",
        notice_title: "Hindi konektado ang opisyal na babala sa baha",
        notice_body: "Nagbibigay ang website na ito ng weather forecast at mga link sa impormasyon ng pamahalaan. Wala itong natatanggap na beripikadong live na antas ng ilog o opisyal na emergency alert. Laging sumangguni sa PAGASA at sa inyong lokal na awtoridad para sa totoong babala.",
        safe_title: "Maging ligtas. Maging handa.",
        safe1_t: "Alamin ang inyong evacuation route",
        safe1_d: "Sundin ang mga tagubilin sa paglikas ng inyong lokal na pamahalaan.",
        safe2_t: "Maghanda ng emergency kit",
        safe2_d: "Ihanda ang inuming tubig, gamot, mahahalagang dokumento at flashlight.",
        safe3_t: "Subaybayan ang mga opisyal na anunsyo",
        safe3_d: "Imonitor ang PAGASA at ang disaster response office ng inyong lungsod o munisipalidad.",
        safe4_t: "Iwasan ang baha",
        safe4_d: "Huwag maglakad o magmaneho sa mga binahang kalsada."
    }
};


const englishText = {};
let lang = "en";


function setLang(next) {
    lang = next;
    document.documentElement.lang = next === "fil" ? "fil" : "en";


    document.querySelectorAll("[data-i18n]").forEach(node => {
        const key = node.dataset.i18n;
        if (!(key in englishText)) englishText[key] = node.textContent;
        node.textContent = next === "fil" ? (i18n.fil[key] || englishText[key]) : englishText[key];
    });


    document.getElementById("langBtn").textContent = next === "fil" ? "EN" : "FIL";
    try { localStorage.setItem("babaw_lang", next); } catch (e) {}
}


document.getElementById("langBtn").onclick = () => setLang(lang === "en" ? "fil" : "en");


try {
    if (localStorage.getItem("babaw_lang") === "fil") setLang("fil");
} catch (e) {}


        /* =========================================
           BRANDING
        ========================================= */


        const logo = document.getElementById("logoTemplate");


        document.querySelectorAll(".logo-slot").forEach(slot => {
            slot.appendChild(
                logo.content.firstElementChild.cloneNode(true)
            );
        });


        const logoMarkup = new XMLSerializer()
            .serializeToString(logo.content.firstElementChild);


        const favicon = document.createElement("link");


        favicon.rel = "icon";
        favicon.type = "image/svg+xml";


        favicon.href =
            "data:image/svg+xml," + encodeURIComponent(logoMarkup);


        document.head.appendChild(favicon);


        /* =========================================
           NCR LOCATIONS
        ========================================= */


        const drrmo = {
                "Caloocan": { office: "Caloocan CDRRMO", phone: "(02) 888-25664" },
                "Las Piñas": { office: "Las Piñas CDRRMO", phone: "(02) 8290-6500" },
                "Makati": { office: "Makati DRRMO", phone: "(02) 8236-5790" },
                "Malabon": { office: "Malabon CDRRMO", phone: "(02) 8921-6029" },
                "Mandaluyong": { office: "Mandaluyong DRRMO", phone: "(02) 8533-2225" },
                "Manila": { office: "Manila DRRMO", phone: "(02) 8463-3295" },
                "Marikina": { office: "Marikina CDRRMO", phone: "161" },
                "Muntinlupa": { office: "Muntinlupa DRRMO", phone: "137-175" },
                "Navotas": { office: "Navotas CDRRMO", phone: "8-281-1111" },
                "Parañaque": { office: "Parañaque CDRRMO", phone: "8820-7783" },
                "Pasay": { office: "Pasay CDRRMO", phone: "09095-493-9111" },
                "Pasig": { office: "Pasig CDRRMO", phone: "8643-0000" },
                "Pateros": { office: "Pateros MDRRMO", phone: "(02) 8642-5159" },
                "Quezon City": { office: "Quezon City DRRMO", phone: "122" },
                "San Juan": { office: "San Juan CDRRMO", phone: "137-135" },
                "Taguig": { office: "Taguig CDRRMO", phone: "(02) 8789-3200" },
                "Valenzuela": { office: "Valenzuela CDRRMO", phone: "(02) 8352-5000" }
            };


        const cities = [
            ["Caloocan", 14.6507, 120.9668],
            ["Las Piñas", 14.4445, 120.9939],
            ["Makati", 14.5547, 121.0244],
            ["Malabon", 14.6625, 120.9567],
            ["Mandaluyong", 14.5794, 121.0359],
            ["Manila", 14.5995, 120.9842],
            ["Marikina", 14.6507, 121.1029],
            ["Muntinlupa", 14.4081, 121.0415],
            ["Navotas", 14.6667, 120.9417],
            ["Parañaque", 14.4793, 121.0198],
            ["Pasay", 14.5378, 121.0014],
            ["Pasig", 14.5764, 121.0851],
            ["Pateros", 14.5454, 121.0687],
            ["Quezon City", 14.6760, 121.0437],
            ["San Juan", 14.6019, 121.0355],
            ["Taguig", 14.5176, 121.0509],
            ["Valenzuela", 14.7011, 120.9830]
        ].map(([name, lat, lng]) => ({
            name,
            lat,
            lng
        }));


        let selectedCity =
                cities.find(c => c.name === loadSavedCity()) ||
                cities.find(c => c.name === "Quezon City");


        function saveCity(name) {
                try { localStorage.setItem("babaw_city", name); } catch (e) { }
            }
            function loadSavedCity() {
                try { return localStorage.getItem("babaw_city"); } catch (e) { return null; }
            }


        let coordinates = {
            lat: selectedCity.lat,
            lng: selectedCity.lng
        };


        let gpsPosition = null;
        let currentUser = null;
        let weatherVersion = 0;
        let map = null;
        let positionMarker = null;


        function setText(id, text) {
            document.getElementById(id).textContent = text;
        }


        /* =========================================
           C++ SERVER AUTHENTICATION
           User accounts and sessions live in backend/server.cpp.
           The browser only sends requests and displays results.
        ========================================= */

        async function authRequest(path, fields = {}) {
            const response = await fetch(path, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                credentials: "same-origin",
                body: new URLSearchParams(fields).toString()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Request failed.");
            return data;
        }

        document.getElementById("showRegister").onclick = () => {
            document.getElementById("loginView").classList.add("hidden");
            document.getElementById("registerView").classList.remove("hidden");
        };
        document.getElementById("showLogin").onclick = () => {
            document.getElementById("registerView").classList.add("hidden");
            document.getElementById("loginView").classList.remove("hidden");
        };

        document.getElementById("registerForm").onsubmit = async event => {
            event.preventDefault();
            const name = document.getElementById("registerName").value.trim();
            const email = document.getElementById("registerEmail").value.trim().toLowerCase();
            const password = document.getElementById("registerPassword").value;
            const confirm = document.getElementById("confirmPassword").value;
            const error = document.getElementById("registerError");
            error.textContent = "";
            if (name.length < 2) { error.textContent = "Please enter your name."; return; }
            if (password.length < 8 || password !== confirm) {
                error.textContent = "Passwords must match and contain at least 8 characters.";
                return;
            }
            try {
                await authRequest("/api/register", {name, email, password, confirm});
                document.getElementById("registerForm").reset();
                document.getElementById("loginEmail").value = email;
                document.getElementById("showLogin").click();
                setText("loginError", "Account created. Please sign in.");
            } catch (err) { error.textContent = err.message; }
        };

        document.getElementById("loginForm").onsubmit = async event => {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const password = document.getElementById("loginPassword").value;
            const remember = document.getElementById("rememberMe").checked;
            try {
                const user = await authRequest("/api/login", {email, password, remember: remember ? "1" : "0"});
                document.getElementById("loginPassword").value = "";
                setText("loginError", "");
                startSession(user);
            } catch (err) { setText("loginError", err.message); }
        };

        // User profile: account details are fetched from the current server session.
        const profileModal = document.getElementById("profileModal");
        const profileForm = document.getElementById("profileForm");
        function closeProfile() { profileModal.classList.add("hidden"); }
        document.getElementById("profileBtn").onclick = () => {
            if (!currentUser) return;
            document.getElementById("profileName").value = currentUser.name || "";
            document.getElementById("profileEmail").value = currentUser.email || "Guest account";
            document.getElementById("profileName").disabled = !currentUser.email;
            document.getElementById("profileSave").disabled = !currentUser.email;
            document.getElementById("profileHint").textContent = currentUser.email
                ? "Update your display name. Email changes are not available in this demo."
                : "Guest profiles are read-only. Sign in to edit your profile.";
            document.getElementById("profileMessage").textContent = "";
            profileModal.classList.remove("hidden");
            document.getElementById("profileClose").focus();
            document.getElementById("deleteZone").classList.toggle("hidden", !currentUser.email);
        };
        document.getElementById("deleteAccountBtn").onclick = async () => {
    if (!currentUser || !currentUser.email) return;

    const message = document.getElementById("deleteMessage");
    const password = document.getElementById("deletePassword").value;
    message.textContent = "";

    if (!password) { message.textContent = "Please enter your password."; return; }
    if (!confirm("Permanently delete your account? This can't be undone.")) return;

    try {
        await authRequest("/api/delete-account", { password });
        Object.keys(localStorage)
            .filter(k => k.startsWith("babaw_"))
            .forEach(k => localStorage.removeItem(k));
        alert("Your account has been deleted.");
        location.reload();      // the session is gone, so this shows the login screen
    } catch (err) {
        message.textContent = err.message;
    }
};
        document.getElementById("profileClose").onclick = closeProfile;
        profileModal.addEventListener("click", event => {
            if (event.target === profileModal) closeProfile();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeProfile();
        });
        profileForm.onsubmit = async event => {
            event.preventDefault();
            const message = document.getElementById("profileMessage");
            const name = document.getElementById("profileName").value.trim();
            message.textContent = "";
            if (name.length < 2 || name.length > 80) {
                message.textContent = "Name must be between 2 and 80 characters.";
                return;
            }
            const save = document.getElementById("profileSave");
            save.disabled = true;
            try {
                const user = await authRequest("/api/profile", {name});
                currentUser = user;
                setText("userName", user.name);
                message.textContent = "Profile updated successfully.";
            } catch (err) {
                message.textContent = err.message;
            } finally {
                save.disabled = false;
            }
        };

        const loader = document.getElementById("loader");
const showLoader = () => loader.classList.remove("hidden");
const hideLoader = () => loader.classList.add("hidden");

function startSession(user) {
    currentUser = user;
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("application").classList.remove("hidden");
    setText("userName", user.name);
    document.getElementById("logoutBtn").textContent = user.email ? "Logout" : "Sign in";
    setText("locationStatus", "Select a city or tap “Use my location”.");
    initializeMap();

    showLoader();
    Promise.race([
        loadWeather(),
        new Promise(resolve => setTimeout(resolve, 4000))
    ]).finally(hideLoader);

    loadAdvisories();
}

        document.getElementById("guestBtn").onclick = async () => {
            try { startSession(await authRequest("/api/guest")); }
            catch (err) { setText("loginError", err.message); }
        };

        document.getElementById("logoutBtn").onclick = async () => {
            try { await authRequest("/api/logout"); }
            catch (err) { console.error("Logout request failed", err); }
            currentUser = null;
            closeProfile();
            gpsPosition = null;
            weatherVersion++;
            document.getElementById("application").classList.add("hidden");
            document.getElementById("authScreen").classList.remove("hidden");
            document.getElementById("loginForm").reset();
            document.getElementById("rememberMe").checked = false;
        };

        // A persistent server cookie restores the login only when Remember me was checked.
        fetch("/api/session", {credentials:"same-origin"})
            .then(r => r.json())
            .then(data => {
                if (data.authenticated) {
                    document.getElementById("rememberMe").checked = Boolean(data.remembered);
                    startSession({name:data.name, email:data.email});
                }
            })
            .catch(err => console.warn("Could not restore session", err));

        /* =========================================
           LOCATION SELECTION
        ========================================= */


        const citySelect =
            document.getElementById("citySelect");


        cities.forEach(city => {
            const option = document.createElement("option");


            option.value = city.name;
            option.textContent = city.name;


            citySelect.appendChild(option);
        });


        citySelect.value = selectedCity.name;


        function selectCity(city) {
            saveCity(city.name);
            selectedCity = city;


            coordinates = {
                lat: city.lat,
                lng: city.lng
            };


            gpsPosition = null;
            citySelect.value = city.name;


            setText(
                "locationName",
                city.name + ", NCR"
            );


            setText(
                "locationStatus",
                "Using approximate city-center coordinates."
            );


            setText(
                "weatherLocation",
                "Forecast for " + city.name + ", NCR"
            );


            updateMap();
            renderHotline();
            loadWeather();
        }


        citySelect.addEventListener("change", () => {
            const city =
                cities.find(c => c.name === citySelect.value);


            if (city) {
                selectCity(city);
            }
        });


        /* =========================================
           GEOLOCATION
        ========================================= */


        function distanceKm(a, b, c, d) {
            const R = 6371;
            const rad = Math.PI / 180;


            const x = (c - a) * rad;
            const y = (d - b) * rad;


            const h =
                Math.sin(x / 2) ** 2 +
                Math.cos(a * rad) *
                Math.cos(c * rad) *
                Math.sin(y / 2) ** 2;


            return 2 * R * Math.asin(
                Math.min(1, Math.sqrt(h))
            );
        }


        function nearestCity(lat, lng) {
            return cities.reduce((best, city) => {
                const d1 =
                    distanceKm(lat, lng, city.lat, city.lng);


                const d2 =
                    distanceKm(lat, lng, best.lat, best.lng);


                return d1 < d2 ? city : best;
            }, cities[0]);
        }


        function requestLocation() {
            if (!navigator.geolocation || !window.isSecureContext) {
                setText(
                    "locationStatus",
                    "Location requires HTTPS or localhost."
                );
                return;
            }


            setText(
                "locationStatus",
                "Requesting browser location permission..."
            );


            navigator.geolocation.getCurrentPosition(
                position => {
                    if (!currentUser) return;


                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const accuracy = position.coords.accuracy;


                    gpsPosition = {
                        lat,
                        lng,
                        accuracy
                    };


                    coordinates = { lat, lng };


                    const near = nearestCity(lat, lng);


                    selectedCity = near;
                    citySelect.value = near.name;


                    const withinApproximateNCR =
                        lat >= 14.35 &&
                        lat <= 14.80 &&
                        lng >= 120.88 &&
                        lng <= 121.18;


                    setText(
                        "locationName",
                        withinApproximateNCR
                            ? "Near " + near.name + ", NCR"
                            : "Current device location"
                    );


                    setText(
                        "locationStatus",
                        "GPS position detected · Approximate accuracy " +
                        Math.round(accuracy) +
                        " m · Nearest NCR city-center: " +
                        near.name
                    );


                    setText(
                        "weatherLocation",
                        "Forecast for your detected coordinates"
                    );


                    updateMap();
                    renderHotline();
                    loadWeather();
                },


                error => {
                    let message =
                        "Unable to determine your location.";


                    if (error.code === 1) {
                        message =
                            "Location permission denied. Choose a city manually.";
                    } else if (error.code === 2) {
                        message =
                            "Device location is unavailable.";
                    } else if (error.code === 3) {
                        message =
                            "Location request timed out. Try again.";
                    }


                    setText("locationStatus", message);
                },


                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 60000
                }
            );
        }


        document.getElementById("locateBtn").onclick =
            requestLocation;


        document.getElementById("mapLocateBtn").onclick =
            requestLocation;


        /* =========================================
           INTERACTIVE MAP
        ========================================= */


        function initializeMap() {
            if (map) {
                setTimeout(() => map.invalidateSize(), 200);
                return;
            }


            if (typeof L === "undefined") {
                setText(
                    "mainMap",
                    "Map unavailable. Check your internet connection."
                );
                return;
            }


            map = L.map("mainMap", {
                scrollWheelZoom: false
            }).setView([14.60, 121.02], 11);


            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 19,
                    attribution: "&copy; OpenStreetMap contributors"
                }
            ).addTo(map);


            cities.forEach(city => {
                const marker = L.circleMarker(
                    [city.lat, city.lng],
                    {
                        radius: 6,
                        color: "#fff",
                        weight: 2,
                        fillColor: "#0867a8",
                        fillOpacity: 1
                    }
                ).addTo(map);


                const popup = document.createElement("div");


                const title = document.createElement("strong");
                title.textContent = city.name + ", NCR";


                const description = document.createElement("p");
                description.textContent =
                    "Approximate city reference point. Not a river gauge.";


                const button = document.createElement("button");
                button.textContent = "View local weather";


                button.style.cssText =
                    "background:#103e58;color:#fff;border:0;" +
                    "padding:8px;border-radius:5px";


                button.onclick = () => {
                    selectCity(city);


                    document.getElementById("overview")
                        .scrollIntoView();
                };


                popup.append(title, description, button);


                marker.bindPopup(popup);
            });


            updateMap();


            setTimeout(() => map.invalidateSize(), 350);
        }


        function updateMap() {
            if (!map) return;
            clearFacilities();


            if (positionMarker) {
                map.removeLayer(positionMarker);
                positionMarker = null;
            }


            positionMarker = L.circleMarker(
                [coordinates.lat, coordinates.lng],
                {
                    radius: 10,
                    color: "#fff",
                    weight: 3,
                    fillColor: gpsPosition
                        ? "#16876b"
                        : "#c97836",
                    fillOpacity: 1
                }
            ).addTo(map);


            positionMarker.bindPopup(
                gpsPosition
                    ? "Your browser-reported position"
                    : "Selected city-center reference"
            );


            map.setView(
                [coordinates.lat, coordinates.lng],
                12
            );
        }


        let radarLayer = null;


            document.getElementById("radarBtn").onclick = async function () {
                if (!map) return;


                if (radarLayer) {
                    map.removeLayer(radarLayer);
                    radarLayer = null;
                    this.textContent = "+ Rain radar";
                    return;
                }


                this.textContent = "Loading...";
                try {
                    const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
                    if (!res.ok) throw new Error("RainViewer error");
                    const meta = await res.json();
                    const frame = meta.radar.past[meta.radar.past.length - 1];


                    radarLayer = L.tileLayer(
                        meta.host + frame.path + "/256/{z}/{x}/{y}/2/1_1.png",
                        { opacity: 0.6, maxNativeZoom: 7, attribution: "Radar © RainViewer" }
                    ).addTo(map);


                    this.textContent = "− Hide radar (" +
                        new Date(frame.time * 1000).toLocaleTimeString("en-PH", {
                            timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit"
                        }) + ")";
                } catch (err) {
                    console.error(err);
                    this.textContent = "Radar unavailable";
                }
            };


        const OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
];

async function fetchOverpass(query) {
    let lastError;
    for (const url of OVERPASS_SERVERS) {
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                body: "data=" + encodeURIComponent(query)
            });
            if (!res.ok) throw new Error(url + " returned " + res.status);
            return await res.json();
        } catch (e) {
            console.warn(e);
            lastError = e;
        }
    }
    throw lastError;
}

document.getElementById("facilitiesBtn").onclick = async function () {
    if (!map) return;
    if (facilityLayer) return clearFacilities();

    this.disabled = true;
    this.textContent = "Loading...";

    const { lat, lng } = coordinates;
    const query = `[out:json][timeout:20];
nwr["amenity"~"^(hospital|fire_station)$"](around:5000,${lat},${lng});
out center 40;`;

    try {
        const json = await fetchOverpass(query);

        facilityLayer = L.layerGroup().addTo(map);
        let count = 0;

        json.elements.forEach(e => {
            const p = e.type === "node" ? { lat: e.lat, lon: e.lon } : e.center;
            if (!p) return;

            const tags = e.tags || {};
            const isHospital = tags.amenity === "hospital";
            const kind = isHospital ? "Hospital" : "Fire station";

            const marker = L.circleMarker([p.lat, p.lon], {
                radius: 7, color: "#fff", weight: 2,
                fillColor: isHospital ? "#c64d48" : "#7a4fb0", fillOpacity: 1
            });

            const box = el("div");
            box.append(el("strong", "", tags.name || kind), el("p", "", kind));
            marker.bindPopup(box).addTo(facilityLayer);
            count++;
        });

        this.textContent = count ? "− Hide facilities (" + count + ")" : "None found nearby";
    } catch (err) {
        console.error(err);
        this.textContent = "Facilities unavailable";
    } finally {
        this.disabled = false;
    }
};


        /* =========================================
           WEATHER API
        ========================================= */


        function describeWeather(code) {
            if (code === 0) return ["Clear sky", "☀️"];
            if (code <= 3) return ["Partly cloudy", "⛅"];
            if (code === 45 || code === 48) return ["Fog", "🌫️"];
            if (code >= 51 && code <= 57) return ["Drizzle", "🌦️"];
            if (code >= 61 && code <= 67) return ["Rain", "🌧️"];
            if (code >= 80 && code <= 82) return ["Rain showers", "🌦️"];
            if (code >= 95) return ["Thunderstorms", "⛈️"];


            return ["Cloudy", "☁️"];
        }


        /* ---------- helpers ---------- */
            const el = (tag, cls, text) => {
                const n = document.createElement(tag);
                if (cls) n.className = cls;
                if (text != null) n.textContent = text;
                return n;
            };


            const locKey = () => coordinates.lat.toFixed(2) + "_" + coordinates.lng.toFixed(2);


            function cacheSet(key, data) {
                try { localStorage.setItem("babaw_" + key, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) { }
            }
            function cacheGet(key) {
                try { return JSON.parse(localStorage.getItem("babaw_" + key)); } catch (e) { return null; }
            }


            function summarizeRain(times, mm) {
                const total = mm.reduce((a, b) => a + (b || 0), 0);
                if (total < 0.5) return "Little to no rain expected in the next 24 hours.";
                const peak = mm.indexOf(Math.max(...mm));
                const h = +times[peak].slice(11, 13);
                const label = (h % 12 || 12) + (h < 12 ? " AM" : " PM");
                return `About ${total.toFixed(1)} mm expected, heaviest around ${label} (${mm[peak].toFixed(1)} mm/h).`;
            }


            /* ---------- chart (aria labels + today marker) ---------- */
            function drawBars(boxId, values, labels, unit, todayIndex = -1) {
                const box = document.getElementById(boxId);
                box.replaceChildren();
                const max = Math.max(0.1, ...values.filter(v => v != null));


                values.forEach((v, i) => {
                    const col = el("div", "bar-col" + (i === todayIndex ? " today" : ""));
                    const area = el("div", "bar-area");
                    const bar = el("div", "bar" + (i === todayIndex ? " today" : i < todayIndex ? " past" : ""));
                    const text = labels[i] + ": " + (v == null ? "n/a" : v) + " " + unit;


                    bar.style.height = ((v ?? 0) / max * 100) + "%";
                    bar.title = text;
                    bar.setAttribute("role", "img");
                    bar.setAttribute("aria-label", text);


                    area.appendChild(bar);
                    col.append(area, el("span", "", labels[i]));
                    box.appendChild(col);
                });
            }


            /* ---------- weather ---------- */
            async function loadWeather() {
                const version = ++weatherVersion;


                ["temperature", "humidity", "rainfall", "peakRain"].forEach(id => setText(id, "—"));
                setText("condition", "Loading weather...");


                const params = new URLSearchParams({
                    latitude: String(coordinates.lat),
                    longitude: String(coordinates.lng),
                    current: "temperature_2m,relative_humidity_2m,weather_code",
                    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
                    hourly: "precipitation,precipitation_probability",
                    forecast_hours: "24",
                    forecast_days: "3",
                    timezone: "Asia/Manila"
                });


                const key = "weather_" + locKey();


                try {
                    const res = await fetch("https://api.open-meteo.com/v1/forecast?" + params, { cache: "no-store" });
                    if (!res.ok) throw new Error("Weather service error");
                    const data = await res.json();
                    if (version !== weatherVersion) return;


                    renderWeather(data);
                    cacheSet(key, data);
                } catch (err) {
                    if (version !== weatherVersion) return;
                    console.error(err);


                    const cached = cacheGet(key);
                    try {
                        if (!cached) throw new Error("No cached data");
                        renderWeather(cached.data, cached.savedAt);
                    } catch (e) {
                        showWeatherError();
                    }
                }


                loadDischarge(version);
                loadFloodStatus(version);
            }


            function renderWeather(data, savedAt) {
                const current = data.current, daily = data.daily;


                if (!current || !daily ||
                    !Number.isFinite(current.temperature_2m) ||
                    !Number.isFinite(current.relative_humidity_2m) ||
                    !Number.isFinite(daily.precipitation_sum[0])) {
                    throw new Error("Invalid weather response");
                }


                setText("temperature", current.temperature_2m.toFixed(1) + "°C");
                setText("humidity", current.relative_humidity_2m + "%");
                setText("rainfall", daily.precipitation_sum[0].toFixed(1) + " mm");
                setText("condition", describeWeather(current.weather_code)[0]);


                setText("weatherTime", savedAt
                    ? "Offline · last updated " + new Date(savedAt).toLocaleString("en-PH", {
                        timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
                    }) + " PHT"
                    : "Open-Meteo · " + current.time.replace("T", " ") + " PHT");


                /* 3-day forecast */
                const forecast = document.getElementById("forecast");
                forecast.replaceChildren();


                for (let i = 0; i < Math.min(3, daily.time.length); i++) {
                    const [description, emoji] = describeWeather(daily.weather_code[i]);
                    const name = new Date(daily.time[i] + "T12:00:00+08:00")
                        .toLocaleDateString("en-PH", { weekday: "long", timeZone: "Asia/Manila" });


                    const day = el("div", "day");
                    day.append(
                        el("strong", "", name),
                        el("div", "day-icon", emoji),
                        el("div", "day-temp", daily.temperature_2m_max[i].toFixed(0) + "° / " + daily.temperature_2m_min[i].toFixed(0) + "°"),
                        el("p", "", description),
                        el("p", "", "Forecast rain: " + daily.precipitation_sum[i].toFixed(1) + " mm")
                    );
                    forecast.appendChild(day);
                }


                /* hourly rain + summary + peak */
                const h = data.hourly;
                if (h) {
                    const rain = h.precipitation.map(v => v || 0);
                    drawBars("hourlyChart", rain, h.time.map(t => t.slice(11, 13)), "mm");
                    setText("rainSummary", summarizeRain(h.time, rain));
                    setText("peakRain", Math.max(...rain).toFixed(1) + " mm/h");


                    const probs = (h.precipitation_probability || []).filter(v => v != null);
                    setText("rainChance", probs.length
                        ? "Highest chance of rain: " + Math.max(...probs) + "%"
                        : "Chance of rain unavailable");
                }
            }


            function showWeatherError() {
                ["temperature", "humidity", "rainfall", "peakRain"].forEach(id => setText(id, "Unavailable"));
                setText("condition", "Could not load weather data.");
                setText("weatherTime", "Open-Meteo unavailable");
                setText("rainSummary", "");
                setText("rainChance", "");
                document.getElementById("forecast").textContent =
                    "Weather forecast unavailable. Check PAGASA for official information.";
                document.getElementById("hourlyChart").textContent = "Unavailable.";
            }

            const LEVEL_TEXT = { low: "Low", watch: "Watch", elevated: "Elevated", high: "High" };

/* flood monitoring and warning data */
            async function loadFloodStatus(version) {
    const badge = document.getElementById("floodLevel");
    const list = document.getElementById("floodReasons");

    try {
        const res = await fetch("/api/flood-status?lat=" + coordinates.lat + "&lng=" + coordinates.lng);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || "Server error");
        if (version !== weatherVersion) return;

        badge.textContent = LEVEL_TEXT[d.level] || "—";
        badge.className = "level-badge level-" + d.level;
        list.replaceChildren(...d.reasons.map(r => el("li", "", r)));

        const time = new Date(d.generatedAt).toLocaleTimeString("en-PH", {
            timeZone: "Asia/Manila", hour: "numeric", minute: "2-digit"
        });
        setText("floodMeta", "Forecast-based, not official · updated " + time + (d.stale ? " (older data)" : ""));
    } catch (e) {
        if (version !== weatherVersion) return;
        console.error(e);
        badge.textContent = "Unavailable";
        badge.className = "level-badge";
        list.replaceChildren(el("li", "", "Flood status is unavailable. Check PAGASA for official information."));
    }
}

async function loadAdvisories() {
    const box = document.getElementById("advisoryList");
    try {
        const res = await fetch("/api/advisories");
        if (!res.ok) throw new Error("Server error");
        const items = await res.json();

        if (!items.length) {
            box.textContent = "No advisories posted. Check PAGASA directly for current bulletins.";
            return;
        }
        box.replaceChildren(...items.map(a => {
            const row = el("div", "advisory");
            const when = new Date(a.posted).toLocaleString("en-PH", {
                timeZone: "Asia/Manila", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
            });
            row.append(el("strong", "", a.title), el("p", "", a.source + " · posted " + when));
            if (a.text) row.append(el("p", "", a.text));
            if (a.url) {
                const link = el("a", "", "View source ↗");
                link.href = a.url; link.target = "_blank"; link.rel = "noopener noreferrer";
                row.append(link);
            }
            return row;
        }));
    } catch (e) {
        console.error(e);
        box.textContent = "Advisories unavailable.";
    }
}


            /* ---------- modeled river discharge ---------- */
            async function loadDischarge(version) {
                const key = "discharge_" + locKey();
                const box = document.getElementById("dischargeChart");
                let d = null;


                try {
                    const params = new URLSearchParams({
                        latitude: String(coordinates.lat),
                        longitude: String(coordinates.lng),
                        daily: "river_discharge",
                        past_days: "7",
                        forecast_days: "7"
                    });
                    const res = await fetch("https://flood-api.open-meteo.com/v1/flood?" + params);
                    if (!res.ok) throw new Error("Flood API error");
                    d = await res.json();
                    cacheSet(key, d);
                } catch (e) {
                    console.error(e);
                    const c = cacheGet(key);
                    d = c && c.data;
                }


                if (version !== weatherVersion) return;


                const vals = d && d.daily && d.daily.river_discharge;
                if (!vals || vals.every(v => v == null)) {
                    box.textContent = "No modeled discharge data for this location.";
                    return;
                }


                // past_days=7 means index 7 is today (orange); earlier days are faded
                drawBars("dischargeChart", vals, d.daily.time.map(t => t.slice(8, 10)), "m³/s", 7);
            }




        document.getElementById("refreshBtn").onclick =
            loadWeather;


        /* =========================================
           RIVER INFORMATION
        ========================================= */


        // Every link points to PAGASA's flood page for now. Replace individual entries
            // with a more specific official page once you've verified one (e.g. a city's own advisory page).
            const rivers = [
                ["Marikina River", "Eastern Metro Manila", "https://pagasa.dost.gov.ph/flood"],
                ["Pasig River", "Central Metro Manila", "https://pagasa.dost.gov.ph/flood"],
                ["Tullahan River", "Northern Metro Manila", "https://pagasa.dost.gov.ph/flood"],
                ["San Juan River", "Metro Manila tributary", "https://pagasa.dost.gov.ph/flood"],
                ["Parañaque River", "Southern Metro Manila", "https://pagasa.dost.gov.ph/flood"]
            ];


            const riverList = document.getElementById("riverList");


            rivers.forEach(([name, area, url]) => {
                const row = el("div", "river-row");
                const info = el("div");
                info.append(el("strong", "", name), el("p", "", area));


                const link = el("a", "btn-light", "Check official info ↗");
                link.href = url;
                link.target = "_blank";
                link.rel = "noopener noreferrer";


                row.append(info, link);
                riverList.appendChild(row);
            });


        /* =========================================
           ACTIVE NAVIGATION ON SCROLL
        ========================================= */


        const sections =
            document.querySelectorAll(".dashboard-section");


        const links =
            document.querySelectorAll("nav a");


        function updateActiveNavigation() {
            let activeId = "overview";


            sections.forEach(section => {
                if (section.getBoundingClientRect().top <= 170) {
                    activeId = section.id;
                }
            });


            links.forEach(link => {
                link.classList.toggle(
                    "active",
                    link.getAttribute("href") === "#" + activeId
                );
            });
        }


        window.addEventListener(
            "scroll",
            updateActiveNavigation,
            { passive: true }
        );


        /* =========================================
           INITIAL STATE
        ========================================= */


        setText(
            "locationName",
            selectedCity.name + ", NCR"
        );


        setText(
            "weatherLocation",
            "Forecast for " + selectedCity.name + ", NCR"
        );


        renderHotline();


        /* =========================================
            HOTLINES
        ========================================= */


        function renderHotline() {
                const info = drrmo[selectedCity.name];
                const call = document.getElementById("drrmoCall");


                setText("drrmoOffice", info ? info.office : selectedCity.name);


                if (info && info.phone) {
                    setText("drrmoPhone", info.phone);
                    call.href = "tel:" + info.phone.replace(/[^\d+]/g, "");
                    call.textContent = "Call " + info.phone;
                    call.classList.remove("hidden");
                } else {
                    setText("drrmoPhone", "Number not added yet. Check your city government's official website.");
                    call.classList.add("hidden");
                }
            }


        const canDial = matchMedia("(pointer: coarse)").matches &&
                /Android|iPhone|iPad/i.test(navigator.userAgent);


            document.addEventListener("click", e => {
                const a = e.target.closest('a[href^="tel:"]');
                if (!a || canDial) return;


                e.preventDefault();
                const number = decodeURIComponent(a.getAttribute("href").slice(4));
                const original = a.textContent;


                navigator.clipboard.writeText(number).then(() => {
                    a.textContent = "Copied " + number + " ✓";
                    setTimeout(() => a.textContent = original, 1800);
                });
            });


        //startSession({ name: "Guest" });