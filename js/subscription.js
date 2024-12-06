import { showNotification } from "/js/noAuthorizeRep.js";
import { checkAutorize } from "/js/communityDetails.js";

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

                    checkAutorize();
                }
            } catch (error) {
                console.log("Error:", error);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

export const handleButtonClick = async (communityId, button) => {
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