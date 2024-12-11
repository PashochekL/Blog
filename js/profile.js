import { navigate } from "/js/routing.js";
import { checkValidation } from "/js/validation.js";

const getProfile = async () => {
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/account/profile",
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.ok) {
            const profileData = await response.json();

            console.log(profileData);

            document.getElementById("inputEmail").value = profileData.email;
            document.getElementById("inputFullName").value = profileData.fullName;
            document.getElementById("inputPhone").value = profileData.phoneNumber;
            document.getElementById("inputGender").value = profileData.gender;
            document.getElementById("inputBirthday").value = profileData.birthDate.slice(0, 10);

            document.getElementById("emailBtn").classList.remove("d-none");
            document.getElementById("loginBtn").classList.add("d-none");

            document.getElementById("emailBtn").textContent  = profileData.email;
            localStorage.setItem("userEmail", profileData.email);
        }
        else {
            const error = await response.json();
            console.log("Unauthorized", error)
        }
    } 
    catch {
        console.error("Error:", error);
    }
};

getProfile();

document.getElementById("btnSave").addEventListener("click", async (event) => {
    event.preventDefault();
    const formData = new FormData(document.getElementById("formProfile"));
    const data = Object.fromEntries(formData.entries());
    const infMessage = document.getElementById("profileMessage");
    infMessage.style.color = "red";

    const [message, validation] = await checkValidation(data, []);

    if(!validation) {
        infMessage.textContent = message;
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/account/profile",
            {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data),
            }
        );

        if (response.ok) {
            console.log("Successful update");
            infMessage.textContent = "Success";
            infMessage.style.color = "green";

            navigate("/");
        }
        else {
            const error = await response.json();
            console.log("Update error", error)
        }
    }
    catch (error) {
        console.error("Error:", error);
        infMessage.textContent = "Произошла ошибка при изменении профиля";
        infMessage.style.color = "red";
    }
});