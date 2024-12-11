import { convertOnlyDate } from "/js/createDateTime.js";
import { navigate } from "/js/routing.js";

const getTopRank = (author, topAuthors) => {
    const index = topAuthors.findIndex(topAuthor => topAuthor.id === author.id);
    return index !== -1 ? index + 1 : null;
};

const createAuthor = async (author, topRank) => {
    const template = document.getElementById("author-template");
    const authorElement = template.content.cloneNode(true);

    let iconUrl;

    if (topRank === 1) {
        iconUrl = author.gender === "Male"
            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkrOzQ3CDkR9rTZD55HsS0U_SWkKac3_1IacGz-vvlEWdZOfGrBUkQiBhzI_L_pWoCgis&usqp=CAU"
            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgpNYWAeHei0BqCT6AiL3z5G6ZqsUgx0jct5sAELwzSx3-OA8j1OhazFlHYwM7fdU1fM4&usqp=CAU";
    } else if (topRank === 2) {
        iconUrl = author.gender === "Male"
            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbWvXjx38atS8WvPMUwCJHJCJbpkxhh63GgZY7ZKCBoanAMT3imHsdH3xWR8XhgvEW3X8&usqp=CAU"
            : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0Ky2nRQYqz8ZqyC4dHm2eYu8NQUtIKSkfMPh3mXVJ9_mE6RDEI8a7Yy6_82J1nT-4UZA&usqp=CAU";
    } else if (topRank === 3) {
        iconUrl = author.gender === "Male"
            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJtPSRtvB8-AYfR64leSdFtooxUFJBxU1DocGOx1b0ONi5jPwae7U8qcGHI9eC3ibei6A&usqp=CAU"
            : "https://cdn-icons-png.flaticon.com/512/1044/1044004.png";
    } else {
        iconUrl = author.gender === "Male"
            ? "https://cdn-icons-png.flaticon.com/512/3884/3884851.png"
            : "https://cdn-icons-png.flaticon.com/512/4086/4086577.png";
    }

    authorElement.querySelector("#peopleImage").src = iconUrl;

    authorElement.querySelector(".author-name").textContent = author.fullName;
    authorElement.querySelector(".author-name").addEventListener("click", () => {
        console.log(author.fullName);
        localStorage.setItem("searchToAuthorName", author.fullName);
        navigate("/");
    });

    authorElement.querySelector(".created-date").textContent = await convertOnlyDate(author.created);
    authorElement.querySelector(".birth-date").textContent = await convertOnlyDate(author.birthDate);

    authorElement.querySelector(".author-posts").textContent = author.posts;
    authorElement.querySelector(".author-likes").textContent = author.likes;

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

            data.forEach((author, index) => {
                author.id = index + 1;
            });

            const topAuthors = [...data]
            .sort((a, b) => {
                if (b.posts === a.posts) {
                    return b.likes - a.likes;
                }
                return b.posts - a.posts;
            })
            .slice(0, 3);
        
            const sortedAuthors = [...data].sort((a, b) => a.fullName.localeCompare(b.fullName));

            let authorContainer = document.getElementById("authorsContainer");
            authorContainer.innerHTML = "";

            for (let author of sortedAuthors) {
                const isTop = getTopRank(author, topAuthors);
                let authorElement = await createAuthor(author, isTop);
                authorContainer.appendChild(authorElement);
            }
            
            data.sort((a, b) => {
                return a.fullName.localeCompare(b.fullName);
            });
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
};

checkAutorize();
