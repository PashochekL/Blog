import { navigate } from "/js/routing.js";
import { checkValidation } from "/js/validation.js";

document.getElementById("btnSignUp").addEventListener("click", async (event) => {
    event.preventDefault();
    const infMessage = document.getElementById("informMessage");
    const formData = new FormData(document.getElementById("formSignUp"));
    infMessage.style.color = "red";

    const data = Object.fromEntries(formData.entries());

    const [message, validation] = await checkValidation(data);

    if(!validation) {
        infMessage.textContent = message;
        return;
    }

    try {
        console.log(data);
        const response = await fetch(
            "https://blog.kreosoft.space/api/account/register",
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            }
        );

        if (response.ok) {
            infMessage.textContent = "Success";
            infMessage.style.color = "green";

            const responseData = await response.json();
            const token = responseData.token;
            localStorage.setItem("token", token);

            console.log("Successful login");

            navigate("/profile");
        }
        else {
            const error = await response.json();
            console.log("Registration error", error)
            infMessage.textContent = "Произошла ошибка при регистрации";
            infMessage.style.color = "red";
        }
    }
    catch (error) {
        console.error("Error:", error);
        infMessage.textContent = "Произошла ошибка при регистрации";
        infMessage.style.color = "red";
    }
});
