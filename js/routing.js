export const navigate = (path) => {
    window.history.pushState({}, path, path);
    handleLocation();
}

document.getElementById("logoutBtn").addEventListener("click", async (event) => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");

    document.getElementById("emailBtn").classList.add("d-none");
    document.getElementById("loginBtn").classList.remove("d-none");
    document.getElementById("authorsPage").classList.add("d-none");
    document.getElementById("comunitiesPage").classList.add("d-none");


    window.history.replaceState({}, "/", "/");
    navigate("/");
});

export const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error("Ошибка при проверке токена:", error);
        return true;
    }
};

document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.matches("nav a[data-route]")) {
        e.preventDefault();
        const href = target.getAttribute("data-route");
        navigate(href);
    }
});

const urlRoutes = {
    404: "/templates/404.html",
    "/": "/templates/minePage.html",
    "/login": "/templates/login.html",
    "/registration": "/templates/registration.html",
    "/profile" : "/templates/profile.html",
    "/authors" : "/templates/authors.html",
    "/comunities" : "/templates/comunities.html",
    "/post/create": "/templates/create.html"
}

const handleLocation = async () => {
    let token = localStorage.getItem("token");
    let path = window.location.pathname;

    const publicRoutes = ["/login", "/registration", "/", "/authors", "/comunities"];

    if ((!token || isTokenExpired(token)) && !publicRoutes.includes(path)) {
        console.warn("Токен отсутствует или истек");
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");

        document.getElementById("emailBtn").classList.add("d-none");
        document.getElementById("loginBtn").classList.remove("d-none");
        document.getElementById("authorsPage").classList.add("d-none");
        document.getElementById("comunitiesPage").classList.add("d-none");

        path = "/login";
        window.history.replaceState({}, "Login", "/login");

        navigate("/login");
    }

    let route = urlRoutes[404];
    let params = {};

    for (const routePath in urlRoutes) {
        const dynamicRouteRegex = new RegExp(
            `^${routePath.replace(/:\w+/g, "([^/]+)")}$`
        );
        const match = path.match(dynamicRouteRegex);

        if (match) {
            route = urlRoutes[routePath];
            const paramNames = (routePath.match(/:\w+/g) || []).map((param) =>
                param.substring(1)
            );
            params = paramNames.reduce((acc, paramName, index) => {
                acc[paramName] = match[index + 1];
                return acc;
            }, {});
            break;
        }
    }

    try {
        const html = await fetch(route).then((response) => response.text());
        const contentContainer = document.getElementById("content");

        if (contentContainer) {
            contentContainer.innerHTML = html;
        }

        loadScriptForPage(path);
    } catch (error) {
        console.error("Error loading route content:", error);
    }
};

const loadScriptForPage = (path) => {
    let scriptSrc = "";
    if (path === "/login") {
        scriptSrc = "/js/login.js";
    } else if (path === "/registration") {
        scriptSrc = "/js/registration.js";
    } else if (path === "/profile") {
        scriptSrc = "/js/profile.js";
    } else if (path === "/") {
        scriptSrc = "/js/minePage.js";
    } else if (path === "/authors") {
        scriptSrc = "/js/authors.js";
    } else if (path === "/comunities") {
        scriptSrc = "/js/comunities.js";
    } else if (path === "/post/create") {
        scriptSrc = "/js/create.js";
    }

    if (scriptSrc) {
        const existingScripts = document.querySelectorAll(`script[src^="${scriptSrc}"]`);
        existingScripts.forEach(script => script.remove());

        const script = document.createElement("script");
        script.src = `${scriptSrc}?t=${Date.now()}`;
        script.type = "module";

        document.body.appendChild(script);
    }
};

window.onpopstate = handleLocation;

handleLocation();

