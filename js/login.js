import { navigate } from "/js/routing.js";

document.getElementById("btnSignUp").addEventListener("click", async (event) => {
    event.preventDefault();
    try {
        navigate("/registration");
    } 
    catch (error) {
        console.error("Navigation error", error);
    }
});

document.getElementById("btnLogin").addEventListener("click", async (event) => {
    event.preventDefault();

    const infMessage = document.getElementById("loginMessage");

    const formData = new FormData(document.getElementById("formLogin"));

    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/account/login",
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (response.ok) {
            infMessage.textContent = "Success";
            infMessage.style.color = "green";
            console.log("Successful login");
            
            const responseData = await response.json();
            const token = responseData.token;
            localStorage.setItem("token", token);

            navigate("/profile");
        }
        else {
            const error = await response.json();
            console.log("Login error", error)
            infMessage.textContent = "Неверные логин или пароль";
            infMessage.style.color = "red";
        }
    }
    catch (error) {
        console.error("Error:", error);
        infMessage.textContent = "Неверные логин или пароль";
        infMessage.style.color = "red";
    }
})