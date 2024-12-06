import { showNotification } from "/js/noAuthorizeRep.js";
import { loadComunityRole } from "/js/loadRole.js";
import { navigate } from "/js/routing.js";

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
            checkAutorize();
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const handleButtonClick = async (communityId, button) => {
    const token = localStorage.getItem("token");

    if (token != null) {
        if (button.textContent == "Отписаться") {
            await SubUnsub(communityId, token, "unsubscribe", "DELETE");
            button.textContent = "Подписаться";
            button.classList.remove("btn-danger");
            button.classList.add("btn-primary");
        }
        else {
            await SubUnsub(communityId, token, "subscribe", "POST");
            button.textContent = "Отписаться";
            button.classList.add("btn-danger");
            button.classList.remove("btn-primary");
        }
    }
    else {
        showNotification("Вы не авторизованы", "danger");
    }
};

const createComunitiesField = async (community) => {
    const template = document.getElementById("comunity-template");
    const comunityElement = template.content.cloneNode(true);

    comunityElement.querySelector(".comunity-name").textContent = community.name;
    comunityElement.querySelector(".comunity-name").addEventListener("click", () => navigate(`/communities/${community.id}`));

    const token = localStorage.getItem("token");
    const buttonSub = comunityElement.querySelector("#buttonSubId");
    buttonSub.addEventListener("click", () => handleButtonClick(community.id, buttonSub));

    let role = "";

    if (token) {
        role = await loadComunityRole(community.id, token);
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

            let communitiesContainer = document.getElementById("comunitiesContainer");
            communitiesContainer.innerHTML = "";
    
            for (let community of data) {
                let communitiesElement = await createComunitiesField(community);
                communitiesContainer.appendChild(communitiesElement);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const checkAutorize = async () => {
    const token = localStorage.getItem("token");
    
    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
    }
    await loadComunities();
}

checkAutorize();