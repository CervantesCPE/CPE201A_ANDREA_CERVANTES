#define _WIN32_WINNT 0x0A00
#define CPPHTTPLIB_OPENSSL_SUPPORT
#include "httplib.h"
#include "json.hpp"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cctype>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <mutex>
#include <optional>
#include <random>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
using namespace httplib;
using json = nlohmann::json;

struct User { string fullName, login, password; }; // DEMO ONLY: plaintext, not production-safe
struct Session { string name, email; bool remembered = false; };
vector<User> users;
map<string, Session> sessions;
mutex mtx;
const string userFile = "users_demo.txt";

string trim(const string& s) {
    size_t a = 0, b = s.size();
    while (a < b && isspace((unsigned char)s[a])) ++a;
    while (b > a && isspace((unsigned char)s[b-1])) --b;
    return s.substr(a, b-a);
}
string toLower(string s) { for (auto& c : s) c = (char)tolower((unsigned char)c); return s; }
string jsonEscape(const string& s) {
    string o;
    for (unsigned char c : s) {
        switch (c) {
            case '"': o += "\\\""; break;
            case '\\': o += "\\\\"; break;
            case '\n': o += "\\n"; break;
            case '\r': o += "\\r"; break;
            case '\t': o += "\\t"; break;
            default: if (c < 32) o += " "; else o += (char)c;
        }
    }
    return o;
}
void sendJson(Response& res, int status, const string& body) {
    res.status = status;
    res.set_content(body, "application/json; charset=utf-8");
    res.set_header("Cache-Control", "no-store");
}
void fail(Response& res, int status, const string& message) {
    sendJson(res, status, "{\"error\":\"" + jsonEscape(message) + "\"}");
}
string userJson(const Session& s) {
    return "{\"name\":\"" + jsonEscape(s.name) + "\",\"email\":\"" + jsonEscape(s.email) + "\"}";
}
void loadUsers() {
    ifstream f(userFile);
    User u;
    while (f >> quoted(u.fullName) >> quoted(u.login) >> quoted(u.password)) users.push_back(u);
}
bool saveUsers() {
    ofstream f(userFile, ios::trunc);
    if (!f) return false;
    for (const auto& u : users) f << quoted(u.fullName) << ' ' << quoted(u.login) << ' ' << quoted(u.password) << '\n';
    f.flush();
    return (bool)f;
}
string newToken() {
    random_device rd;
    const char* hex = "0123456789abcdef";
    string t;
    for (int i = 0; i < 64; ++i) t += hex[rd() % 16];
    return t;
}
string cookieToken(const Request& req) {
    string cookies = req.get_header_value("Cookie");
    istringstream in(cookies);
    string part;
    while (getline(in, part, ';')) {
        part = trim(part);
        if (part.rfind("session=", 0) == 0) return part.substr(8);
    }
    return "";
}
void startSession(Response& res, const Session& s) {
    const string token = newToken();
    { lock_guard<mutex> lock(mtx); sessions[token] = s; }
    string cookie = "session=" + token + "; HttpOnly; SameSite=Lax; Path=/";
    if (s.remembered) cookie += "; Max-Age=604800"; // seven days
    res.set_header("Set-Cookie", cookie);
}

/* =========================================================
   FLOOD MONITORING
   Forecast-based only. NOT an official warning service.
========================================================= */

struct FloodCacheEntry { json data; time_t fetched; };
map<string, FloodCacheEntry> floodCache;
mutex cacheMtx;
const int CACHE_SECONDS = 600;               // 10 minutes

string isoUtc(time_t t) {
    tm g{};
#ifdef _WIN32
    gmtime_s(&g, &t);
#else
    gmtime_r(&t, &g);
#endif
    char buf[32];
    strftime(buf, sizeof buf, "%Y-%m-%dT%H:%M:%SZ", &g);
    return buf;
}

double num(const json& v, double fallback = 0.0) {
    return v.is_number() ? v.get<double>() : fallback;
}
double round1(double v) { return std::round(v * 10.0) / 10.0; }
string fixed4(double v) { ostringstream o; o << fixed << setprecision(4) << v; return o.str(); }
string fixed1(double v) { ostringstream o; o << fixed << setprecision(1) << v; return o.str(); }

optional<json> fetchJson(const string& host, const string& path) {
    Client cli(host);
    cli.set_connection_timeout(5);
    cli.set_read_timeout(8);
    cli.set_follow_location(true);
    auto r = cli.Get(path);
    if (!r || r->status != 200) return nullopt;
    try { return json::parse(r->body); }
    catch (...) { return nullopt; }
}

/* ---------- rain ---------- */
struct RainStats {
    bool ok = false;
    double maxHourly = 0, total24 = 0;
    int maxProb = -1;
    string peakTime;
};

RainStats analyseRain(const json& j) {
    RainStats r;
    if (!j.contains("hourly")) return r;
    const auto& h = j["hourly"];
    if (!h.contains("precipitation") || !h["precipitation"].is_array()) return r;

    const auto& p = h["precipitation"];
    const auto& t = h["time"];
    for (size_t i = 0; i < p.size(); ++i) {
        double mm = num(p[i]);
        r.total24 += mm;
        if (mm > r.maxHourly) {
            r.maxHourly = mm;
            if (i < t.size() && t[i].is_string()) r.peakTime = t[i].get<string>();
        }
    }
    if (h.contains("precipitation_probability") && h["precipitation_probability"].is_array())
        for (const auto& v : h["precipitation_probability"])
            if (v.is_number()) r.maxProb = max(r.maxProb, (int)v.get<double>());

    r.ok = !p.empty();
    return r;
}

/* ---------- modeled river discharge ----------
   Request uses past_days=7 + forecast_days=7, so indexes 0-6 are the past
   week, index 7 is today, and 8-13 are the forecast. */
struct Discharge {
    bool ok = false;
    double today = 0, pastMean = 0, peakForecast = 0, ratio = 0;
    string peakDate;
};

Discharge analyseDischarge(const json& j) {
    Discharge d;
    if (!j.contains("daily")) return d;
    const auto& dl = j["daily"];
    if (!dl.contains("river_discharge") || !dl["river_discharge"].is_array()) return d;

    const auto& q = dl["river_discharge"];
    const auto& t = dl["time"];
    if (q.size() < 9 || !q[7].is_number()) return d;

    double sum = 0; int n = 0;
    for (size_t i = 0; i < 7; ++i)
        if (q[i].is_number()) { sum += q[i].get<double>(); ++n; }
    if (n == 0) return d;

    d.pastMean = sum / n;
    d.today = q[7].get<double>();
    d.peakForecast = d.today;
    for (size_t i = 7; i < q.size(); ++i) {
        if (q[i].is_number() && q[i].get<double>() >= d.peakForecast) {
            d.peakForecast = q[i].get<double>();
            if (i < t.size() && t[i].is_string()) d.peakDate = t[i].get<string>();
        }
    }
    d.ratio = d.pastMean > 0 ? d.peakForecast / d.pastMean : 0;
    d.ok = true;
    return d;
}

/* ---------- scoring ----------
   Rain bands follow the general idea of PAGASA's rainfall warning levels
   (about 7.5 / 15 / 30 mm per hour). Those are for observed rain, and this
   uses forecast rain, so treat the numbers as tunable. Verify them against
   PAGASA before changing the wording. */
const char* LEVELS[] = { "low", "watch", "elevated", "high" };
const char* LEVEL_LABELS[] = {
    "Low forecast rain", "Heavy rain possible",
    "Heavy rain likely", "Very heavy rain forecast"
};

int assess(const RainStats& r, const Discharge& d, vector<string>& why) {
    int lvl = 0;
    if (r.maxHourly >= 30 || r.total24 >= 100)      lvl = 3;
    else if (r.maxHourly >= 15 || r.total24 >= 50)  lvl = 2;
    else if (r.maxHourly >= 7.5 || r.total24 >= 25) lvl = 1;

    if (lvl > 0)
        why.push_back("Forecast rain peaks at " + fixed1(r.maxHourly) + " mm/h, with " +
                      fixed1(r.total24) + " mm expected over the next 24 hours.");

    if (d.ok && d.ratio >= 2.0 && d.peakForecast > 0) {
        why.push_back("Modeled river discharge is forecast to reach about " +
                      fixed1(d.ratio) + "x its recent 7-day average.");
        if (lvl >= 1 && lvl < 3) ++lvl;      // rain plus a rising river raises one level
    }
    if (why.empty()) why.push_back("No significant rain or river rise in the forecast.");
    return lvl;
}

/* ---------- GET /api/flood-status ---------- */
void handleFloodStatus(const Request& req, Response& res) {
    double lat = 0, lng = 0;
    try {
        if (!req.has_param("lat") || !req.has_param("lng")) throw 1;
        lat = stod(req.get_param_value("lat"));
        lng = stod(req.get_param_value("lng"));
    } catch (...) { fail(res, 400, "lat and lng are required numbers."); return; }

    // rough NCR bounding box
    if (!isfinite(lat) || !isfinite(lng) ||
        lat < 14.30 || lat > 14.85 || lng < 120.85 || lng > 121.25) {
        fail(res, 400, "Location is outside the NCR coverage area."); return;
    }

    char keyBuf[32];
    snprintf(keyBuf, sizeof keyBuf, "%.2f_%.2f", lat, lng);
    const string key = keyBuf;
    const time_t now = time(nullptr);

    {   // fresh cache hit
        lock_guard<mutex> lock(cacheMtx);
        auto it = floodCache.find(key);
        if (it != floodCache.end() && now - it->second.fetched < CACHE_SECONDS) {
            json out = it->second.data;
            out["cached"] = true;
            sendJson(res, 200, out.dump());
            return;
        }
    }

    // network calls happen outside any lock
    const string coords = "latitude=" + fixed4(lat) + "&longitude=" + fixed4(lng);
    auto rainJson = fetchJson("https://api.open-meteo.com",
        "/v1/forecast?" + coords +
        "&hourly=precipitation,precipitation_probability&forecast_hours=24&timezone=Asia%2FManila");
    auto flowJson = fetchJson("https://flood-api.open-meteo.com",
        "/v1/flood?" + coords + "&daily=river_discharge&past_days=7&forecast_days=7");

    RainStats rain = rainJson ? analyseRain(*rainJson) : RainStats{};

    if (!rain.ok) {   // upstream failed: serve stale data if we have any
        lock_guard<mutex> lock(cacheMtx);
        auto it = floodCache.find(key);
        if (it != floodCache.end()) {
            json out = it->second.data;
            out["cached"] = true;
            out["stale"] = true;
            sendJson(res, 200, out.dump());
            return;
        }
        fail(res, 502, "Weather data is temporarily unavailable. Check PAGASA for official information.");
        return;
    }

    Discharge dis = flowJson ? analyseDischarge(*flowJson) : Discharge{};
    vector<string> why;
    int lvl = assess(rain, dis, why);

    json out = {
        {"level", LEVELS[lvl]},
        {"label", LEVEL_LABELS[lvl]},
        {"reasons", why},
        {"rain", {
            {"maxHourlyMm", round1(rain.maxHourly)},
            {"total24hMm", round1(rain.total24)},
            {"maxProbabilityPct", rain.maxProb},
            {"peakTime", rain.peakTime}
        }},
        {"discharge", dis.ok ? json{
            {"todayM3s", round1(dis.today)},
            {"recentMeanM3s", round1(dis.pastMean)},
            {"forecastPeakM3s", round1(dis.peakForecast)},
            {"forecastPeakDate", dis.peakDate}
        } : json(nullptr)},
        {"official", false},
        {"source", "Open-Meteo forecast and modeled river discharge"},
        {"generatedAt", isoUtc(now)},
        {"cached", false},
        {"stale", false},
        {"disclaimer", "Forecast-based estimate, not an official flood warning. "
                       "Check PAGASA and your local DRRMO."}
    };

    {
        lock_guard<mutex> lock(cacheMtx);
        floodCache[key] = {out, now};   // bounded: only 2-decimal points inside the NCR box
    }
    sendJson(res, 200, out.dump());
}

/* =========================================================
   MANUAL OFFICIAL ADVISORIES
   An admin copies real PAGASA/LGU bulletins in by hand.
   Set the BABAW_ADMIN_KEY environment variable to enable posting.
========================================================= */

struct Advisory {
    string title, source, url, text;
    long long posted = 0;
};
vector<Advisory> advisories;
mutex advMtx;
const string advisoryFile = "advisories_demo.txt";
const size_t MAX_ADVISORIES = 20;

void loadAdvisories() {
    ifstream f(advisoryFile);
    Advisory a;
    while (f >> quoted(a.title) >> quoted(a.source) >> quoted(a.url) >> quoted(a.text) >> a.posted)
        advisories.push_back(a);
}
bool saveAdvisories() {
    ofstream f(advisoryFile, ios::trunc);
    if (!f) return false;
    for (const auto& a : advisories)
        f << quoted(a.title) << ' ' << quoted(a.source) << ' ' << quoted(a.url) << ' '
          << quoted(a.text) << ' ' << a.posted << '\n';
    f.flush();
    return (bool)f;
}

void handleGetAdvisories(const Request&, Response& res) {
    json arr = json::array();
    {
        lock_guard<mutex> lock(advMtx);
        for (const auto& a : advisories)
            arr.push_back({{"title", a.title}, {"source", a.source}, {"url", a.url},
                           {"text", a.text}, {"posted", isoUtc((time_t)a.posted)}});
    }
    sendJson(res, 200, arr.dump());
}

void handlePostAdvisory(const Request& req, Response& res) {
    const char* envKey = getenv("BABAW_ADMIN_KEY");
    const string given = req.get_header_value("X-Admin-Key");
    if (!envKey || !*envKey || given != envKey) { fail(res, 403, "Not authorized."); return; }

    Advisory a;
    a.title  = trim(req.get_param_value("title"));
    a.source = trim(req.get_param_value("source"));
    a.url    = trim(req.get_param_value("url"));
    a.text   = trim(req.get_param_value("text"));
    a.posted = (long long)time(nullptr);

    if (a.title.size() < 3 || a.title.size() > 120)  { fail(res, 400, "Title must be 3-120 characters."); return; }
    if (a.source.empty() || a.source.size() > 60)    { fail(res, 400, "Source is required (max 60)."); return; }
    if (a.text.size() > 600)                         { fail(res, 400, "Text is too long (max 600)."); return; }
    if (!a.url.empty() && (a.url.rfind("https://", 0) != 0 || a.url.size() > 300)) {
        fail(res, 400, "URL must start with https://"); return;
    }

    lock_guard<mutex> lock(advMtx);
    advisories.insert(advisories.begin(), a);
    if (advisories.size() > MAX_ADVISORIES) advisories.resize(MAX_ADVISORIES);
    if (!saveAdvisories()) { advisories.erase(advisories.begin()); fail(res, 500, "Unable to save advisory."); return; }
    sendJson(res, 201, "{\"message\":\"Advisory posted\"}");
}

int main() {
    loadUsers();
    loadAdvisories();
    Server svr;
    if (!svr.set_mount_point("/", "../frontend")) {
        cerr << "Cannot locate ../frontend. Run the server from the backend directory.\n";
        return 1;
    }
    svr.Get("/", [](const Request&, Response& res) { res.set_redirect("/index.html"); });
    svr.Get("/api/session", [](const Request& req, Response& res) {
        lock_guard<mutex> lock(mtx);
        auto it = sessions.find(cookieToken(req));
        if (it == sessions.end()) { sendJson(res, 200, "{\"authenticated\":false}"); return; }
        const auto& s = it->second;
        sendJson(res, 200, "{\"authenticated\":true,\"name\":\"" + jsonEscape(s.name) +
            "\",\"email\":\"" + jsonEscape(s.email) + "\",\"remembered\":" +
            (s.remembered ? "true" : "false") + "}");
    });
    svr.Post("/api/register", [](const Request& req, Response& res) {
        const string name = trim(req.get_param_value("name"));
        const string email = toLower(trim(req.get_param_value("email")));
        const string pass = req.get_param_value("password");
        const string confirm = req.get_param_value("confirm");
        if (name.size() < 2) { fail(res, 400, "Please enter your name."); return; }
        if (email.find('@') == string::npos || email.size() > 254) { fail(res, 400, "Enter a valid email."); return; }
        if (pass.size() < 8 || pass != confirm) { fail(res, 400, "Passwords must match and contain at least 8 characters."); return; }
        lock_guard<mutex> lock(mtx);
        for (const auto& u : users) if (u.login == email) {
            fail(res, 409, "An account with this email already exists."); return;
        }
        users.push_back({name, email, pass});
        if (!saveUsers()) { users.pop_back(); fail(res, 500, "Unable to save account on server."); return; }
        sendJson(res, 201, "{\"message\":\"Account created. Please sign in.\"}");
    });
    svr.Post("/api/login", [](const Request& req, Response& res) {
        const string email = toLower(trim(req.get_param_value("email")));
        const string pass = req.get_param_value("password");
        const bool remember = req.get_param_value("remember") == "1";
        Session s;
        {
            lock_guard<mutex> lock(mtx);
            auto it = find_if(users.begin(), users.end(), [&](const User& u) {
                return u.login == email && u.password == pass;
            });
            if (it == users.end()) { fail(res, 401, "Incorrect login details. Create a demo account first."); return; }
            s = {it->fullName, it->login, remember};
        }
        startSession(res, s);
        sendJson(res, 200, userJson(s));
    });
    svr.Post("/api/guest", [](const Request&, Response& res) {
        Session s{"Guest", "", false};
        startSession(res, s);
        sendJson(res, 200, userJson(s));
    });
    // Update display name for a signed-in demo account.
    svr.Post("/api/profile", [](const Request& req, Response& res) {
        const string token = cookieToken(req);
        const string name = trim(req.get_param_value("name"));
        if (name.size() < 2 || name.size() > 80) {
            fail(res, 400, "Name must be between 2 and 80 characters."); return;
        }
        lock_guard<mutex> lock(mtx);
        auto session = sessions.find(token);
        if (session == sessions.end() || session->second.email.empty()) {
            fail(res, 401, "Please sign in to edit your profile."); return;
        }
        auto user = find_if(users.begin(), users.end(), [&](const User& u) {
            return u.login == session->second.email;
        });
        if (user == users.end()) { fail(res, 404, "Account not found."); return; }
        const string previous = user->fullName;
        user->fullName = name;
        if (!saveUsers()) {
            user->fullName = previous;
            fail(res, 500, "Unable to save profile."); return;
        }
        for (auto& entry : sessions) {
            if (entry.second.email == user->login) entry.second.name = name;
        }
        sendJson(res, 200, userJson(session->second));
    });
    svr.Post("/api/logout", [](const Request& req, Response& res) {
        { lock_guard<mutex> lock(mtx); sessions.erase(cookieToken(req)); }
        res.set_header("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
        sendJson(res, 200, "{\"message\":\"Logged out\"}");
    });
    svr.Post("/api/delete-account", [](const Request& req, Response& res) {
    const string token = cookieToken(req);
    const string pass = req.get_param_value("password");
    lock_guard<mutex> lock(mtx);
    auto session = sessions.find(token);
    if (session == sessions.end() || session->second.email.empty()) {
        fail(res, 401, "Please sign in first."); return;
    }
    const string email = session->second.email;
    auto user = find_if(users.begin(), users.end(), [&](const User& u) {
        return u.login == email;
    });
    if (user == users.end()) { fail(res, 404, "Account not found."); return; }
    if (user->password != pass) { fail(res, 403, "Incorrect password."); return; }
    User removed = *user;
    users.erase(user);
    if (!saveUsers()) {
        users.push_back(removed);
        fail(res, 500, "Unable to delete account."); return;
    }
    for (auto it = sessions.begin(); it != sessions.end();) {
        if (it->second.email == email) it = sessions.erase(it);
        else ++it;
    }
    res.set_header("Set-Cookie", "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    sendJson(res, 200, "{\"message\":\"Account deleted\"}");
});
    svr.Get("/api/flood-status", handleFloodStatus);
    svr.Get("/api/advisories", handleGetAdvisories);
    svr.Post("/api/advisory", handlePostAdvisory);
    int port = 10000;
    if (const char* envPort = std::getenv("PORT")) {
        try { port = std::stoi(envPort); }
        catch (...) { std::cerr << "Invalid PORT value\n"; return 1; }
    }
    std::cout << "BaBaW starting on port " << port << std::endl;
    if (!svr.listen("0.0.0.0", port)) {
        std::cerr << "Failed to listen on port " << port << std::endl;
        return 1;
    }
    return 0;
}
