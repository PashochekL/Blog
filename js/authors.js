import { convertOnlyDate } from "/js/createDateTime.js";
import { navigate } from "/js/routing.js";

const createAuthor = async (author) => {
    const template = document.getElementById("author-template");
    const authorElement = template.content.cloneNode(true);

    const iconUrl = author.gender === "Male" ? "https://cdn-icons-png.flaticon.com/512/3884/3884851.png" 
        : "https://cdn-icons-png.flaticon.com/512/4086/4086577.png";

    authorElement.querySelector("#peopleImage").src = iconUrl;
    authorElement.querySelector(".author-name").textContent = author.fullName;
    authorElement.querySelector(".author-name").addEventListener("click", () => {
        console.log(author.fullName);
        localStorage.setItem("searchToAuthorName", author.fullName);
        navigate("/");
    });

    authorElement.querySelector(".created-date").textContent = await convertOnlyDate(author.created);
    authorElement.querySelector(".birth-date").textContent = await convertOnlyDate(author.birthDate);

    authorElement.querySelector(".author-posts").textContent = author.likes;
    authorElement.querySelector(".author-likes").textContent = author.posts;

    return authorElement;
};


const loadAuthors = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/author/list",
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

            let authorContainer = document.getElementById("authorsContainer");
            authorContainer.innerHTML = "";
    
            for (let author of data) {
                let authorElement = await createAuthor(author);
                authorContainer.appendChild(authorElement);
            }
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const checkAutorize = () => {
    const token = localStorage.getItem("token");
    
    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
    }
    loadAuthors();
}

checkAutorize();