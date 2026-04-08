const APP_ID = "test_app";
const ALL_MOCK_EVENTS = [
    {
        id: "1",
        title: "After Hours Live",
        datetime: "2026-04-20T20:00:00",
        artist: {
            name: "The Weeknd",
            image_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "Madison Square Garden",
            city: "New York",
            region: "NY",
            country: "USA"
        }
    },
    {
        id: "2",
        title: "Starboy Tour",
        datetime: "2026-05-02T19:30:00",
        artist: {
            name: "The Weeknd",
            image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "Crypto.com Arena",
            city: "Los Angeles",
            region: "CA",
            country: "USA"
        }
    },
    {
        id: "3",
        title: "Night Drive Set",
        datetime: "2026-05-11T21:00:00",
        artist: {
            name: "The Midnight",
            image_url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "Red Rocks Amphitheatre",
            city: "Morrison",
            region: "CO",
            country: "USA"
        }
    },
    {
        id: "4",
        title: "Golden Hour Sessions",
        datetime: "2026-06-08T19:00:00",
        artist: {
            name: "Kacey Musgraves",
            image_url: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "Ryman Auditorium",
            city: "Nashville",
            region: "TN",
            country: "USA"
        }
    },
    {
        id: "5",
        title: "Neon Skyline Tour",
        datetime: "2026-06-20T20:30:00",
        artist: {
            name: "CHVRCHES",
            image_url: "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "House of Blues",
            city: "Chicago",
            region: "IL",
            country: "USA"
        }
    },
    {
        id: "6",
        title: "Pacific Nights",
        datetime: "2026-07-03T21:00:00",
        artist: {
            name: "ODESZA",
            image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
        },
        venue: {
            name: "WaMu Theater",
            city: "Seattle",
            region: "WA",
            country: "USA"
        }
    }
];

const EVENT_RATINGS = {
    "1": { score: 4.8, count: 312 },
    "2": { score: 4.6, count: 248 },
    "3": { score: 4.7, count: 186 },
    "4": { score: 4.9, count: 402 },
    "5": { score: 4.5, count: 221 },
    "6": { score: 4.8, count: 367 }
};

function getEventRatingText(eventId) {
    const rating = EVENT_RATINGS[eventId];
    if (!rating) return "★ New event";
    return `★ ${rating.score} · ${rating.count} attendee ratings`;
}

function formatPreviewTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
}

let currentEvents = JSON.parse(localStorage.getItem("mockEvents")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function seedDemoUser() {
    const users = getUsers();
    const exists = users.some(user => user.username === "bob" || user.email === "bob@mail.com");

    if (!exists) {
        users.push({
            id: "demo-user",
            name: "Bob",
            username: "bob",
            email: "bob@mail.com",
            password: "bobpass"
        });
        saveUsers(users);
    }
}

function updateAuthUI() {
    const authActions = document.getElementById("auth-actions") || document.querySelector(".nav-actions");
    if (!authActions) return;

    if (currentUser) {
        authActions.innerHTML = `
            <span style="color: #cbd5e1;">Hi, ${currentUser.name || currentUser.username}</span>
            <button class="btn btn-secondary" id="logout-btn" type="button">Logout</button>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logoutUser);
        }
    } else {
        authActions.innerHTML = `
            <a class="btn btn-secondary" href="login.html">Login</a>
            <a class="btn btn-primary" href="signup.html">Sign Up</a>
        `;
    }
}

function requireLogin() {
    if (!currentUser) {
        localStorage.setItem("redirectAfterLogin", window.location.pathname.split("/").pop() || "index.html");
        showToast("Please log in first");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 500);
        return false;
    }
    return true;
}

function loginUser(identifier, password) {
    const users = getUsers();
    const user = users.find(u =>
        (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (!user) {
        showToast("Invalid login details");
        return false;
    }

    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    showToast("Logged in successfully");

    const redirectPage = localStorage.getItem("redirectAfterLogin") || "my-events.html";
    localStorage.removeItem("redirectAfterLogin");

    setTimeout(() => {
        window.location.href = redirectPage;
    }, 700);

    return true;
}

function signupUser(name, username, email, password, confirmPassword) {
    const users = getUsers();

    if (password !== confirmPassword) {
        showToast("Passwords do not match");
        return false;
    }

    const exists = users.some(u => u.username === username || u.email === email);
    if (exists) {
        showToast("Account already exists");
        return false;
    }

    const newUser = {
        id: Date.now().toString(),
        name,
        username,
        email,
        password
    };

    users.push(newUser);
    saveUsers(users);
    currentUser = newUser;
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    showToast("Account created successfully");

    setTimeout(() => {
        window.location.href = "my-events.html";
    }, 700);

    return true;
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    showToast("Logged out");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 500);
}

console.log("app.js connected");

async function fetchArtistEvents(artistName) {
    console.log("Fetching events for:", artistName);

    const searchTerm = artistName.toLowerCase().trim();

    currentEvents = ALL_MOCK_EVENTS.filter(event =>
        event.artist.name.toLowerCase().includes(searchTerm) ||
        event.title.toLowerCase().includes(searchTerm) ||
        event.venue.city.toLowerCase().includes(searchTerm) ||
        event.venue.region.toLowerCase().includes(searchTerm)
    );

    console.log("Filtered mock response:", currentEvents);
    localStorage.setItem("mockEvents", JSON.stringify(currentEvents));

    return currentEvents;
}

function renderFeaturedEvents() {
    const featuredContainer = document.getElementById("featured-events");

    if (!featuredContainer) return;

    featuredContainer.innerHTML = "";

    currentEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card glass";

        const favoriteLabel = isFavorite(event.id) ? "Favorited" : "Favorite";
        const goingLabel = isGoing(event.id) ? "I'm Going" : "I'm Not Going";

        card.innerHTML = `
            <img class="event-image" src="${event.artist.image_url}" alt="${event.title}">
            <div class="event-content">
                <div class="event-top">
                    <div>
                        <h3 class="event-title">${event.title}</h3>
                        <p class="event-subtitle">${event.artist.name}</p>
                        <p class="rating-line">${getEventRatingText(event.id)}</p>
                    </div>
                </div>

                <div class="meta">
                                        <div>${new Date(event.datetime).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                    <div>${event.venue.name}</div>
                    <div>${event.venue.city}, ${event.venue.region}</div>
                </div>

                <div class="card-actions">
                    <button class="btn btn-primary ${isGoing(event.id) ? 'active-btn' : ''}" onclick="toggleGoing('${event.id}')">${goingLabel}</button>
                    <button class="btn btn-secondary ${isFavorite(event.id) ? 'active-btn' : ''}" onclick="toggleFavorite('${event.id}')">
  ${favoriteLabel}
</button>
                </div>
            </div>
        `;

        featuredContainer.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    seedDemoUser();
    updateAuthUI();
    const featuredContainer = document.getElementById("featured-events");
    if (featuredContainer) {
        await fetchArtistEvents("The Weeknd");
        renderFeaturedEvents();
    }

    const nearbyBtn = document.getElementById("nearby-btn");
    if (nearbyBtn) {
        nearbyBtn.addEventListener("click", () => {
            getUserLocation();
        });
    }

    const searchBtn = document.getElementById("search-btn");
    if (searchBtn) {
        searchBtn.addEventListener("click", async () => {
            const artistInput = document.getElementById("artist-search").value.trim();

            if (!artistInput) {
                resetEventsPage();
                return;
            }

            const matches = await fetchArtistEvents(artistInput);
            renderEventsPage();

            if (matches.length === 0) {
                showToast(`No events found for "${artistInput}"`);
            }
        });
    }

    const eventsGrid = document.getElementById("events-grid");
    if (eventsGrid && currentEvents.length === 0) {
        currentEvents = ALL_MOCK_EVENTS;
        localStorage.setItem("mockEvents", JSON.stringify(currentEvents));
        renderEventsPage();
    } else if (eventsGrid) {
        renderEventsPage();
    }

    if (document.getElementById("favorites-list") && document.getElementById("going-list")) {
        renderMyEventsPage();
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const identifier = document.getElementById("login-identifier").value.trim();
            const password = document.getElementById("login-password").value;
            loginUser(identifier, password);
        });
    }

    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const name = document.getElementById("signup-name").value.trim();
            const username = document.getElementById("signup-username").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("signup-confirm").value;
            signupUser(name, username, email, password, confirmPassword);
        });
    }

    const artistTitle = document.getElementById("artist-page-title");
    const artistStatus = document.getElementById("artist-status");
    const artistName = getArtistNameFromUrl();

    const artistNameHeading = document.getElementById("artist-name");
    const artistTagline = document.getElementById("artist-tagline");
    const artistContext = document.getElementById("artist-context");
    const ticketLink = document.getElementById("ticket-link");

    if (artistNameHeading && artistName) {
        artistNameHeading.textContent = artistName;
    }

    if (artistTitle && artistName) {
        artistTitle.textContent = artistName;
    }

    if (artistStatus && artistName) {
        artistStatus.textContent = `Loading Deezer-backed tracks and previews for ${artistName}.`;
    }

    if (artistTagline && artistName) {
        artistTagline.textContent = `Explore ${artistName}'s biggest tracks, preview their sound, and decide whether this artist belongs on your shortlist.`;
    }

    if (artistContext && artistName) {
        artistContext.textContent = `${artistName} is part of the discovery layer of Live Events Finder. This page helps users get familiar with the performer before deciding whether to save the event, mark attendance, or continue exploring similar artists.`;
    }

    if (ticketLink && artistName) {
        ticketLink.href = "events.html";
        ticketLink.textContent = `Find ${artistName} Events`;
    }

    const aboutSecondaryCta = document.getElementById("about-secondary-cta");
    if (aboutSecondaryCta && currentUser) {
        aboutSecondaryCta.href = "my-events.html";
        aboutSecondaryCta.textContent = "Go to My Events";
    }

    const deezerSearchBtn = document.getElementById("deezer-search-btn");
    if (deezerSearchBtn) {
        deezerSearchBtn.addEventListener("click", () => {
            loadArtistTracks();
        });
    }

    const artistPreviewDemoBtn = document.getElementById("artist-preview-demo-btn");
    if (artistPreviewDemoBtn) {
        artistPreviewDemoBtn.addEventListener("click", () => {
            loadArtistTracks();
        });
    }
});

function getCityFromCoordinates(lat, lon) {
    if (lat >= 40 && lat <= 41.5 && lon >= -75 && lon <= -73) {
        return "New York";
    }
    if (lat >= 33 && lat <= 35 && lon >= -119 && lon <= -117) {
        return "Los Angeles";
    }
    if (lat >= 39 && lat <= 40.5 && lon >= -106 && lon <= -104) {
        return "Morrison";
    }
    if (lat >= 35 && lat <= 37 && lon >= -88 && lon <= -86) {
        return "Nashville";
    }
    if (lat >= 41 && lat <= 43 && lon >= -89 && lon <= -87) {
        return "Chicago";
    }
    if (lat >= 47 && lat <= 48.5 && lon >= -123 && lon <= -121) {
        return "Seattle";
    }
    return null;
}

function filterEventsByCity(city) {
    currentEvents = ALL_MOCK_EVENTS.filter(event => event.venue.city === city);
    localStorage.setItem("mockEvents", JSON.stringify(currentEvents));
}

function renderEventsPage() {
    const container = document.getElementById("events-grid");

    if (!container) return;

    container.innerHTML = "";

    if (currentEvents.length === 0) {
        container.innerHTML = `
            <article class="event-card glass">
                <div class="event-content">
                    <h3 class="event-title">No matching events found</h3>
                    <p class="meta">Try searching for an artist, event title, city, or region from the available listings.</p>
                    <div class="card-actions">
                        <button class="btn btn-primary" type="button" onclick="resetEventsPage()">Show All Events</button>
                    </div>
                </div>
            </article>
        `;
        return;
    }

    currentEvents.forEach(event => {
        const card = document.createElement("article");
        card.className = "event-card glass";

        const favoriteLabel = isFavorite(event.id) ? "Favorited" : "Favorite";
        const goingLabel = isGoing(event.id) ? "I'm Going" : "I'm Not Going";

        card.innerHTML = `
            <img class="event-image" src="${event.artist.image_url}" alt="${event.title}">
            <div class="event-content">
                <h3 class="event-title">${event.title}</h3>
                <p class="event-subtitle">${event.artist.name}</p>
                <p class="rating-line">${getEventRatingText(event.id)}</p>

                <div class="meta">
                    <div>${new Date(event.datetime).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        })}</div>
                    <div>${event.venue.name}</div>
                    <div>${event.venue.city}, ${event.venue.region}</div>
                </div>

                <div class="card-actions">
                   <button class="btn btn-primary ${isGoing(event.id) ? 'active-btn' : ''}" onclick="toggleGoing('${event.id}')">
  ${goingLabel}
</button>
                    <button class="btn btn-secondary ${isFavorite(event.id) ? 'active-btn' : ''}" onclick="toggleFavorite('${event.id}')">${favoriteLabel}</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function isFavorite(eventId) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.includes(eventId);
}

function isGoing(eventId) {
    const goingEvents = JSON.parse(localStorage.getItem("goingEvents")) || [];
    return goingEvents.includes(eventId);
}

function toggleFavorite(eventId) {
    if (!requireLogin()) return;
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const exists = favorites.includes(eventId);

    if (exists) {
        favorites = favorites.filter(id => id !== eventId);
        showToast("Removed from favorites");
    } else {
        favorites.push(eventId);
        showToast("Added to favorites");
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));

    renderFeaturedEvents();
    renderEventsPage();
    renderMyEventsPage();
}

function toggleGoing(eventId) {
    if (!requireLogin()) return;
    let goingEvents = JSON.parse(localStorage.getItem("goingEvents")) || [];

    const exists = goingEvents.includes(eventId);

    if (exists) {
        goingEvents = goingEvents.filter(id => id !== eventId);
        showToast("Removed from going list");
    } else {
        goingEvents.push(eventId);
        showToast("You're going to this event");
    }

    localStorage.setItem("goingEvents", JSON.stringify(goingEvents));

    renderFeaturedEvents();
    renderEventsPage();
    renderMyEventsPage();
}

function showToast(message) {
    let toast = document.getElementById("toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast glass";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

function createSavedCard(event) {
    const card = document.createElement("article");
    card.className = "event-card glass";

    const favoriteLabel = isFavorite(event.id) ? "Favorited" : "Favorite";
    const goingLabel = isGoing(event.id) ? "I'm Going" : "I'm Not Going";

    card.innerHTML = `
        <img class="event-image" src="${event.artist.image_url}" alt="${event.title}">
        <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <p class="event-subtitle">${event.artist.name}</p>
            <p class="rating-line">${getEventRatingText(event.id)}</p>

            <div class="meta">
                <div>${new Date(event.datetime).toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })}</div>
                <div>${event.venue.name}</div>
                <div>${event.venue.city}, ${event.venue.region}</div>
            </div>

            <div class="card-actions">
                <button class="btn btn-primary ${isGoing(event.id) ? 'active-btn' : ''}" onclick="toggleGoing('${event.id}')">${goingLabel}</button>
                <button class="btn btn-secondary ${isFavorite(event.id) ? 'active-btn' : ''}" onclick="toggleFavorite('${event.id}')">${favoriteLabel}</button>
            </div>
        </div>
    `;

    return card;
}

function renderMyEventsPage() {
    const favContainer = document.getElementById("favorites-list");
    const goingContainer = document.getElementById("going-list");

    if (!favContainer || !goingContainer) return;

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const going = JSON.parse(localStorage.getItem("goingEvents")) || [];

    favContainer.innerHTML = "";
    goingContainer.innerHTML = "";

    const favoriteEvents = currentEvents.filter(event => favorites.includes(event.id));
    const goingEventsList = currentEvents.filter(event => going.includes(event.id));

    if (favoriteEvents.length === 0) {
        favContainer.innerHTML = `<div class="glass form-card">No favorite events yet.</div>`;
    } else {
        favoriteEvents.forEach(event => {
            favContainer.appendChild(createSavedCard(event));
        });
    }

    if (goingEventsList.length === 0) {
        goingContainer.innerHTML = `<div class="glass form-card">No going events yet.</div>`;
    } else {
        goingEventsList.forEach(event => {
            goingContainer.appendChild(createSavedCard(event));
        });
    }
}

function getUserLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log("Location:", lat, lon);

            showToast("Location detected");

            const userCity = getCityFromCoordinates(lat, lon);

            if (!userCity) {
                currentEvents = ALL_MOCK_EVENTS;
                localStorage.setItem("mockEvents", JSON.stringify(currentEvents));
                showToast("Showing popular events");
                renderFeaturedEvents();
                renderEventsPage();
                return;
            }

            filterEventsByCity(userCity);

            if (currentEvents.length === 0) {
                showToast(`No nearby events found for ${userCity}`);
            } else {
                showToast(`Showing events near ${userCity}`);
            }

            renderFeaturedEvents();
            renderEventsPage();
        },
        () => {
            showToast("Unable to access location");
        }
    );
}

function getArtistNameFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("name");
}

function fetchDeezerJsonp(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `deezerCallback_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        window[callbackName] = (data) => {
            resolve(data);
            delete window[callbackName];
            script.remove();
        };

        const script = document.createElement("script");
        script.src = `${url}${url.includes("?") ? "&" : "?"}output=jsonp&callback=${callbackName}`;
        script.onerror = () => {
            reject(new Error("Deezer request failed"));
            delete window[callbackName];
            script.remove();
        };

        document.body.appendChild(script);
    });
}

async function loadArtistTracks() {
    const artistName = getArtistNameFromUrl();
    const artistStatus = document.getElementById("artist-status");
    const tracksGrid = document.getElementById("artist-tracks-grid");
    const artistImage = document.getElementById("artist-image");

    if (!artistName || !artistStatus || !tracksGrid) return;

    artistStatus.textContent = `Searching Deezer for ${artistName}...`;
    tracksGrid.innerHTML = "";

    try {
        const searchData = await fetchDeezerJsonp(
            `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`
        );

        if (!searchData.data || searchData.data.length === 0) {
            artistStatus.textContent = `No Deezer match found for ${artistName}.`;
            tracksGrid.innerHTML = `
                <article class="event-card glass">
                    <div class="event-content">
                        <h3 class="event-title">No tracks found</h3>
                        <p class="meta">We couldn’t find Deezer track data for this artist right now.</p>
                    </div>
                </article>
            `;
            return;
        }

        const matchedArtist = searchData.data[0];

        const artistPageTitle = document.getElementById("artist-page-title");
        const artistNameHeading = document.getElementById("artist-name");

        if (artistPageTitle) artistPageTitle.textContent = matchedArtist.name;
        if (artistNameHeading) artistNameHeading.textContent = matchedArtist.name;
        if (artistImage && matchedArtist.picture_xl) artistImage.src = matchedArtist.picture_xl;

        artistStatus.textContent = `Loading top tracks for ${matchedArtist.name}...`;

        const tracksData = await fetchDeezerJsonp(
            `https://api.deezer.com/artist/${matchedArtist.id}/top?limit=5`
        );

        if (!tracksData.data || tracksData.data.length === 0) {
            artistStatus.textContent = `No top tracks available for ${matchedArtist.name}.`;
            return;
        }

        artistStatus.textContent = `Showing Deezer top tracks for ${matchedArtist.name}.`;

        tracksGrid.innerHTML = tracksData.data.map((track, index) => `
            <article class="event-card glass">
                <img class="event-image" src="${track.album.cover_big}" alt="${track.title}">
                <div class="event-content">
                    <h3 class="event-title">#${index + 1} ${track.title}</h3>
                    <p class="event-subtitle">${track.artist.name}</p>

                    <div class="meta">
                        <div>Album: ${track.album.title}</div>
                        <div>Duration: ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, "0")}</div>
                        <div>Preview available: ${track.preview ? "Yes" : "No"}</div>
                    </div>

                    <div class="card-actions">
                        <div class="preview-player" data-preview="${track.preview || ""}">
                            <button class="preview-btn ${track.preview ? "" : "is-disabled"}" type="button">
                                ${track.preview ? "Play Preview" : "No Preview"}
                            </button>
                            <div class="preview-progress">
                                <span class="preview-progress-fill"></span>
                            </div>
                            <span class="preview-time">0:00 / 0:30</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join("");
        attachPreviewPlayerBehavior();
    } catch (error) {
        console.error(error);
        artistStatus.textContent = "Could not load Deezer artist data right now.";
        tracksGrid.innerHTML = `
            <article class="event-card glass">
                <div class="event-content">
                    <h3 class="event-title">Something went wrong</h3>
                    <p class="meta">The Deezer request failed. Try again in a moment.</p>
                </div>
            </article>
        `;
    }
}

let activePreviewAudio = null;
let activePreviewButton = null;
let activePreviewFill = null;
let activePreviewTime = null;

function resetActivePreviewUi() {
    if (activePreviewButton) {
        activePreviewButton.textContent = "Play Preview";
        activePreviewButton.classList.remove("is-paused");
    }
    if (activePreviewFill) {
        activePreviewFill.style.width = "0%";
    }
    if (activePreviewTime) {
        activePreviewTime.textContent = "0:00 / 0:30";
    }
}

function stopActivePreview() {
    if (activePreviewAudio) {
        activePreviewAudio.pause();
        activePreviewAudio.currentTime = 0;
    }
    resetActivePreviewUi();
    activePreviewAudio = null;
    activePreviewButton = null;
    activePreviewFill = null;
    activePreviewTime = null;
}

function attachPreviewPlayerBehavior() {
    document.querySelectorAll(".preview-player").forEach((player) => {
        const button = player.querySelector(".preview-btn");
        const fill = player.querySelector(".preview-progress-fill");
        const timeLabel = player.querySelector(".preview-time");
        const previewUrl = player.dataset.preview;

        if (!button || !fill || !timeLabel || button.dataset.bound === "true") {
            return;
        }

        button.dataset.bound = "true";

        if (!previewUrl) {
            return;
        }

        button.addEventListener("click", () => {
            if (activePreviewAudio && activePreviewButton === button) {
                stopActivePreview();
                return;
            }

            stopActivePreview();

            const audio = new Audio(previewUrl);
            activePreviewAudio = audio;
            activePreviewButton = button;
            activePreviewFill = fill;
            activePreviewTime = timeLabel;

            button.textContent = "Pause Preview";
            button.classList.add("is-paused");

            audio.addEventListener("timeupdate", () => {
                if (!audio.duration) return;
                const progress = (audio.currentTime / audio.duration) * 100;
                fill.style.width = `${progress}%`;
                timeLabel.textContent = `${formatPreviewTime(audio.currentTime)} / ${formatPreviewTime(audio.duration)}`;
            });

            audio.addEventListener("ended", () => {
                stopActivePreview();
            });

            audio.play().catch(() => {
                stopActivePreview();
            });
        });
    });
}


function resetEventsPage() {
    currentEvents = ALL_MOCK_EVENTS;
    localStorage.setItem("mockEvents", JSON.stringify(currentEvents));
    renderEventsPage();
}