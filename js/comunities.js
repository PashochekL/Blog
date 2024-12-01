import { showNotification } from "/js/noAuthorizeRep.js";
import { isTokenExpired } from "/js/routing.js";

const SubUnsub = async (id, token, path, endpoint) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/${id}/${path}`,
            {
                method: endpoint,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
            }
        );
        if (response.ok) {
            console.log(`${path} УСПЕШНО`)
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const loadComunityRole = async (id) => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/${id}/role`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();
            console.log("ROLE:", data);

            return data;
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const handleButtonClick = async (comunityId, button) => {
    const token = localStorage.getItem("token");

    if (token != null) {
        if (button.textContent == "Отписаться") {
            await SubUnsub(comunityId, token, "unsubscribe", "DELETE");
            button.textContent = "Подписаться";
            button.classList.remove("btn-danger");
            button.classList.add("btn-primary");
        }
        else {
            await SubUnsub(comunityId, token, "subscribe", "POST");
            button.textContent = "Отписаться";
            button.classList.add("btn-danger");
            button.classList.remove("btn-primary");
        }
    }
    else {
        showNotification("Вы не авторизованы", "danger");
    }
};

const createComunitiesField = async (comunity) => {
    const template = document.getElementById("comunity-template");
    const comunityElement = template.content.cloneNode(true);

    comunityElement.querySelector(".comunity-name").textContent = comunity.name;
    comunityElement.querySelector(".author-name").addEventListener("click", () => {
        console.log(comunity.name);
        //navigate("/");
    });

    const token = localStorage.getItem("token");
    const buttonSub = comunityElement.querySelector("#buttonSubId");
    buttonSub.addEventListener("click", () => handleButtonClick(comunity.id, buttonSub));

    let role = "";

    if (token != null) {
        role = await loadComunityRole(comunity.id);
    }

    if (role != "") {
        if (role == "Administrator") {
            buttonSub.classList.add("d-none");
        }
        else if (role == "Subscriber") {
            buttonSub.textContent = "Отписаться";
            buttonSub.classList.remove("btn-primary");
            buttonSub.classList.add("btn-danger");
        }
    }

    return comunityElement;
};

const loadComunities = async () => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/community",
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();

            let comunitiesContainer = document.getElementById("comunitiesContainer");
            comunitiesContainer.innerHTML = "";
    
            for (let comunity of data) {
                let comunitiesElement = await createComunitiesField(comunity);
                comunitiesContainer.appendChild(comunitiesElement);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const checkAutorize = async () => {
    const token = localStorage.getItem("token");
    
    if (token && !isTokenExpired(token)) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
    }
    await loadComunities();
}

checkAutorize();