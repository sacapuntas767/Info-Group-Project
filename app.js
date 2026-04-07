const APP_ID = "test_app";
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

    const mockEvents = [
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
        }
    ];

    const searchTerm = artistName.toLowerCase();

    currentEvents = mockEvents.filter(event =>
        event.artist.name.toLowerCase().includes(searchTerm) ||
        event.title.toLowerCase().includes(searchTerm)
    );

    console.log("Filtered mock response:", currentEvents);
    localStorage.setItem("mockEvents", JSON.stringify(currentEvents));
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
                alert("Enter an artist name");
                return;
            }

            await fetchArtistEvents(artistInput);
            renderEventsPage();
        });
    }
    renderMyEventsPage();

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
});

function renderEventsPage() {
    const container = document.getElementById("events-grid");

    if (!container) return;

    container.innerHTML = "";

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

            console.log("User location:", lat, lon);
            showToast("Location detected");

            // For now just reload featured events
            fetchArtistEvents("The Weeknd");
            renderFeaturedEvents();
        },
        () => {
            showToast("Unable to get location");
        }
    );
}