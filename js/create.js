import { navigate } from "/js/routing.js";
import { checkValidation } from "/js/validation.js";
import { showNotification } from "/js/noAuthorizeRep.js";

let selectedTags = [];

const createPost = async () => {
    const infMessage = document.getElementById("createPostMessage");
    const formData = new FormData(document.getElementById("createField"));
    infMessage.style.color = "red";

    const data = Object.fromEntries(formData.entries());
    console.log("selectedTags", selectedTags);

    data.tags = selectedTags; 

    const [message, validation] = await checkValidation(data, selectedTags);

    if(!validation) {
        infMessage.classList.remove("d-none");
        infMessage.textContent = message;
        return;
    }

    if (selectedTags.length === 0) {
        infMessage.classList.remove("d-none");
        infMessage.textContent = "Выберите хотя бы один тэг";
        return;
    }

    if (data.addressId === "") {
        data.addressId = null;
    }

    console.log("Sending data:", JSON.stringify(data));
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/post`,
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            }
        );

        if (response.ok) {
            infMessage.textContent = "Success";
            infMessage.style.color = "green";
            infMessage.classList.remove("d-none");
            const data = await response.json();
            
            localStorage.setItem("idNewPost", data);
            navigate("/");
            //infMessage.classList.add("d-none");
        }
    }
    catch (error) {
        console.log("Error:", error);
    }
}

document.getElementById("btnCreate").addEventListener("click", () => createPost());

const handleTagClick = (tagElement, tagId) => {
    if (selectedTags.includes(tagId)) {
        selectedTags = selectedTags.filter(tag => tag !== tagId);
        tagElement.style.backgroundColor = "";
    } else {
        selectedTags.push(tagId);
        tagElement.style.backgroundColor = "#007bff";
    }
};

const loadTags = async (token) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/tag`,
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
            console.log(data);
            const scrollContainer = document.getElementById("scrollContainer");
            scrollContainer.innerHTML = "";

            data.forEach(tag => {
                const tagElement = document.createElement("div");
                tagElement.textContent = tag.name;
                tagElement.id = tag.id;
                tagElement.className = "tag";

                tagElement.addEventListener("click", () => handleTagClick(tagElement, tag.id));
                scrollContainer.appendChild(tagElement);
              });

        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const checkAutorize = () => {
    const token = localStorage.getItem("token");

    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
        loadTags(token);
        // если перехожу на эту страницу со страницы группы, то надо поменять option на название группы в label=Группа
    }
    else {
        showNotification("Время действия на странице завершено", "danger")
        navigate("/login");
    }
}

checkAutorize();