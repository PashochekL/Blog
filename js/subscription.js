import { showNotification } from "/js/noAuthorizeRep.js";
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
            console.log(`${path} УСПЕШНО`);
            
            try {
                const response = await fetch(
                    `https://blog.kreosoft.space/api/community/${id}`,
                    {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json"
                        }
                    }
                );
            
                if (response.ok) {
                    const data = await response.json();
    
                    const countSub = document.getElementById("countSub");
                    countSub.textContent = data.subscribersCount;

                    navigate(`/communities/${id}`);
                    // if (path == "unsubscribe") {
                    //     getInfCommunity(id, null);
                    // } else if ("subscribe") {
                    //     getInfCommunity(id, "Subscriber");
                    // }
                    // //getInfCommunity();
                }
            } catch (error) {
                console.log("Error:", error);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

export const handleButtonClick = async (communityId, button, countSub) => {
    const token = localStorage.getItem("token");

    if (token != null) {
        if (button.textContent == "Отписаться") {
            button.textContent = "Подписаться";
            button.classList.remove("btn-danger");
            button.classList.add("btn-primary");
            SubUnsub(communityId, token, "unsubscribe", "DELETE");
        }
        else {
            button.textContent = "Отписаться";
            button.classList.add("btn-danger");
            button.classList.remove("btn-primary");
            SubUnsub(communityId, token, "subscribe", "POST");
        }
    }
    else {
        showNotification("Вы не авторизованы", "danger");
    }
};