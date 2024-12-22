import { navigate } from "/js/routing.js";
import { showNotification } from "/js/noAuthorizeRep.js";
import { loadComunityRole } from "/js/loadRole.js";
import { dateConversion } from "/js/createDateTime.js";
import { handleButtonClick } from "/js/subscription.js";

let countPostPage = 5;
let currentPage = 1;
let totalPages = 0;
let selectedTags = [];

const urlPath = (path, params) => {
    return `${path}?${params.toString()}`;
};

const getStartURL = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        tags: params.has("tags") ? params.getAll("tags") : [],
        sorting: params.get("sorting") || null,
        page: parseInt(params.get("page"), 10) || 1,
        size: parseInt(params.get("size"), 10) || 5,
    };
};

const createURL = (communityId, state) => {
    const params = new URLSearchParams();
    selectedTags = [];
    
    if (state.tags.length > 0) {
        state.tags.forEach(tag => {
            params.append("tags", tag);
            selectedTags.push(tag);
        });
    }
    if (state.sorting) {
        params.set("sorting", state.sorting);
        document.getElementById("inputSort").value = state.sorting;
    }
    if (state.page) params.set("page", state.page);
    if (state.size) params.set("size", state.size);

    currentPage = state.page;
    countPostPage = state.size;

    const baseURL = urlPath(`http://localhost:5173/communities/${communityId}`, params);
    window.history.pushState({}, "", baseURL); 
  
    const url = urlPath(`https://blog.kreosoft.space/api/community/${communityId}/post`, params);
    return url;
};

const likeOnPost = async (url, requestMethod, data, heartImage) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(url,
            {
                method: requestMethod,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {
            showNotification("Вы не авторизованы", "danger");
            return;
        }

        if (response.ok) {
            const countLikes = document.getElementById(`${data.id}`);
            if (requestMethod == "POST") {
                heartImage.classList.remove("bi-heart");
                heartImage.classList.add("bi-heart-fill");
                heartImage.style.filter = "invert(42%) sepia(99%) saturate(6442%) hue-rotate(0deg) brightness(98%) contrast(102%)";
                countLikes.textContent = data.likes + 1;
                data.likes += 1;
            } else {
                heartImage.classList.remove("bi-heart-fill");
                heartImage.classList.add("bi-heart");
                heartImage.style.filter = "";
                countLikes.textContent = data.likes - 1;
                data.likes -= 1;
            }
            console.log("УСПЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕЕХ");
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const handleLikeClick = (heartImage, data) => {
    if (heartImage.classList.contains("bi-heart")) {
        const params = new URLSearchParams(window.location.search);
        const url = urlPath(`https://blog.kreosoft.space/api/post/${data.id}/like`, params);
        likeOnPost(url, "POST", data, heartImage);
    } else {
        const params = new URLSearchParams(window.location.search);
        const url = urlPath(`https://blog.kreosoft.space/api/post/${data.id}/like`, params);
        likeOnPost(url, "DELETE", data, heartImage);
    }
}

const titleClick = (post) => {
    localStorage.setItem("postId", post.id);
    navigate(`/post/${post.id}`)
};

const handleChatClick = (postId) => {
    console.log("Чат кликнут", postId);
    localStorage.setItem("scrollToComments", "true");
    localStorage.setItem("postId", postId);
    navigate(`/post/${postId}`);
}

const handleTagClick = (tagElement, tagId) => {
    if (selectedTags.includes(tagId)) {
        selectedTags = selectedTags.filter(tag => tag !== tagId);
        tagElement.style.backgroundColor = "";
    } else {
        selectedTags.push(tagId);
        tagElement.style.backgroundColor = "#007bff";
    }
};

const showPostOnPage = async (post) => {
    const template = document.getElementById("post-template");
    const postElement = template.content.cloneNode(true);

    postElement.querySelector(".author").textContent = post.author;
    postElement.querySelector(".date").textContent = await dateConversion(post.createTime);
    postElement.querySelector(".title").textContent = post.title;
    postElement.querySelector(".title").addEventListener("click", () => titleClick(post))
    const description = postElement.querySelector('.description');
    description.textContent = post.description;
    postElement.querySelector(".reading-time").textContent = `Время чтения: ${post.readingTime} мин.`;
    postElement.querySelector(".likes-count").textContent = post.likes;
    postElement.querySelector(".likes-count").id = post.id;
    postElement.querySelector(".comments-count").textContent = post.commentsCount;
    postElement.querySelector(`.toggleButton`).id = `toggleButton-${post.id}`;
    
    const toggleButton = postElement.querySelector(`#toggleButton-${post.id}`);
    const computedStyle = window.getComputedStyle(description);
    const descriptionHeight = parseFloat(computedStyle.height);
        
    if (descriptionHeight > 50) {
        toggleButton.classList.remove("d-none");
    } else {
        description.style.height = "auto";
    }
    
    toggleButton.addEventListener("click", function() {
        if (description.style.maxHeight === "50px") {
            description.style.maxHeight = "1000px";
            description.style.height = "auto";
            toggleButton.textContent = "Скрыть текст";
        } else {
            description.style.maxHeight = "50px";
            toggleButton.textContent = "Читать полностью";
        }
    });

    if (post.image) {
        postElement.querySelector("#image").src = post.image;
    } else {
        postElement.querySelector("#image").classList.add("d-none");
    }

    const heartImg = postElement.querySelector(".heartImg");
    if (heartImg) {
        heartImg.addEventListener("click", () => handleLikeClick(heartImg, post));
    }

    postElement.querySelector(`.chatIcn`).id = `chatImg-${post.id}`;
    const chatImg = postElement.querySelector(`#chatImg-${post.id}`);
    if (chatImg) {
        chatImg.addEventListener("click", () => handleChatClick(post.id));
    }

    if (post.hasLike && heartImg) {
        heartImg.classList.remove("bi-heart");
        heartImg.classList.add("bi-heart-fill");
        heartImg.style.filter = "invert(42%) sepia(99%) saturate(6442%) hue-rotate(0deg) brightness(98%) contrast(102%)";
    }

    const hashtagsContainer = postElement.querySelector(".hashtags-container");
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach((tags) => {
            let hashtagElement = document.createElement("a");
            hashtagElement.className = "text me-2 pe-3 text-secondary text-decoration-none";
            hashtagElement.textContent = `#${tags.name}`;
            hashtagsContainer.appendChild(hashtagElement);
        });
    }
    return postElement;
};

const loadPosts = async (url) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(url,
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
            totalPages = data.pagination.count;

            let postContainer = document.getElementById("postContainer");
            postContainer.innerHTML = "";
    
            for (let post of data.posts) {
                let postElement = await showPostOnPage(post);
                postContainer.appendChild(postElement);
            }
            const countPost = document.getElementById("countPostOnPage");
            countPost.value = countPostPage;

            await renderPagination();
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const updatePage = async (newPage) => {
    let communityId;
    const pathParts = window.location.pathname.split("/");

    if (pathParts.length === 3 && pathParts[1] === "communities") {
        communityId = pathParts[2];
    }
    
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage);
    const baseURL = urlPath(`http://localhost:5173/communities/${communityId}`, params);
    window.history.pushState({}, "", baseURL); 

    currentPage = newPage;
    const url = urlPath(`https://blog.kreosoft.space/api/community/${communityId}/post`, params);

    await loadPosts(url);
};

const updateSize = async (newSize) => {
    let communityId;
    const pathParts = window.location.pathname.split("/");

    if (pathParts.length === 3 && pathParts[1] === "communities") {
        communityId = pathParts[2];
    }
    const params = new URLSearchParams(window.location.search);
    params.set("size", newSize);
    const baseURL = urlPath(`http://localhost:5173/communities/${communityId}`, params);

    window.history.pushState({}, "", baseURL); 
    const url = urlPath(`https://blog.kreosoft.space/api/community/${communityId}/post`, params);

    await loadPosts(url);
};

const checkParams = async () => {
    const newParams = new URLSearchParams();
    const pathParts = window.location.pathname.split("/");
    let communityId;

    if (pathParts.length === 3 && pathParts[1] === "communities") {
        communityId = pathParts[2];
    }

    const sort = document.getElementById("inputSort");
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    const size = params.get("size");

    if (selectedTags && selectedTags.length > 0) {
        selectedTags.forEach(tag => {
            newParams.append("tags", tag);
        });
    }
    if (sort.value) newParams.append("sorting", sort.value);
    newParams.append("page", page);
    newParams.append("size", size);

    const baseURL = urlPath(`http://localhost:5173/communities/${communityId}`, newParams);
    window.history.pushState({}, "", baseURL);
    const url = urlPath(`https://blog.kreosoft.space/api/community/${communityId}/post`, newParams);

    await loadPosts(url);
};

const renderCountElement = async () => {
    const countPost = document.getElementById("countPostOnPage");
    countPostPage = parseInt(countPost.value, 10);
    await updateSize(countPostPage);
};

const renderPagination = async () => {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    const ul = document.createElement("ul");
    ul.classList.add("pagination", "pagination-sm");
    const prevLi = document.createElement("li");
    prevLi.classList.add("page-item");

    if (currentPage === 1) prevLi.classList.add("disabled");

    const prevButton = document.createElement("button");
    prevButton.classList.add("page-link");
    prevButton.innerHTML = "&laquo;";
    prevButton.addEventListener("click", async () => {
        if (currentPage > 1) {
            currentPage--;
            await updatePage(currentPage);
        }
    });
    prevLi.appendChild(prevButton);
    ul.appendChild(prevLi);

    let startPage = 1;
    let endPage = 1;

    if (totalPages <= 3) {
        startPage = 1;
        endPage = totalPages;
    } else if (currentPage === 1) {
        startPage = 1;
        endPage = 3;
    } else if (currentPage === totalPages) {
        startPage = totalPages - 2;
        endPage = totalPages;
    } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement("li");
        pageLi.classList.add("page-item");

        if (i === currentPage) pageLi.classList.add("active");

        const pageButton = document.createElement("button");
        pageButton.classList.add("page-link");
        pageButton.textContent = i;
        pageButton.addEventListener("click", async () => {
            currentPage = i;
            await updatePage(currentPage);
        });

        pageLi.appendChild(pageButton);
        ul.appendChild(pageLi);
    }
    const nextLi = document.createElement("li");
    nextLi.classList.add("page-item");

    if (currentPage === totalPages) nextLi.classList.add("disabled");

    const nextButton = document.createElement("button");
    nextButton.classList.add("page-link");
    nextButton.innerHTML = "&raquo;";
    nextButton.addEventListener("click", async () => {
        if (currentPage < totalPages) {
            currentPage++;
            await updatePage(currentPage);
        }
    });
    nextLi.appendChild(nextButton);
    ul.appendChild(nextLi);
    paginationContainer.appendChild(ul);
};

const createAdmin = async (admin) => {
    const template = document.getElementById("admin-template");
    const adminElement = template.content.cloneNode(true);
    const iconUrl = admin.gender === "Male" ? "https://cdn-icons-png.flaticon.com/512/3884/3884851.png" 
        : "https://cdn-icons-png.flaticon.com/512/4086/4086577.png";

    adminElement.querySelector("#peopleImage").src = iconUrl;
    adminElement.querySelector(".admin-name").textContent = admin.fullName;
    return adminElement;
};

export const getInfCommunity = async (communityId, role) => {
        try {
            const response = await fetch(
                `https://blog.kreosoft.space/api/community/${communityId}`,
                {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json"
                    }
                }
            );
        
            if (response.ok) {
                const data = await response.json();
                const comunityName = document.getElementById("comunityName");
                comunityName.textContent = `"${data.name}"`;

                const buttonCreate = document.getElementById("btnCreate");
                buttonCreate.addEventListener("click", () => {
                    localStorage.setItem("communityName", data.name);
                    console.log("communityName", data.name)
                    navigate("/post/create");
                });

                const countSub = document.getElementById("countSub");
                countSub.textContent = data.subscribersCount;

                const typeComunity = document.getElementById("typeComunity");
                localStorage.setItem("typeCommunity", data.isClosed);

                if (data.isClosed) {
                    typeComunity.textContent = "закрытое";
                }
    
                let adminContainer = document.getElementById("AdminsContainer");
                adminContainer.innerHTML = "";
        
                for (let admin of data.administrators) {
                    let adminElement = await createAdmin(admin);
                    adminContainer.appendChild(adminElement);
                }

                document.getElementById("countPostOnPage").addEventListener("change", async () => {
                    if (!data.isClosed || role == "Administrator" || role == "Subscriber") {
                        renderCountElement();
                    }
                });
                document.getElementById("btnApply").addEventListener("click", async () => {
                    if (!data.isClosed || role == "Administrator" || role == "Subscriber") {
                        checkParams();
                    }
                });

                if (!data.isClosed) {
                    const params = getStartURL();
                    const url = createURL(communityId, params);
                    await loadPosts(url);
                } else if (data.isClosed && (role == "Subscriber" || role == "Administrator")) {
                    const params = getStartURL();
                    const url = createURL(communityId, params);
                    await loadPosts(url);
                } else {
                    let postContainer = document.getElementById("postContainer");
                    postContainer.innerHTML = "";
                    window.history.pushState({}, "", `http://localhost:5173/communities/${communityId}`); 
                }
            }
        } catch (error) {
            console.log("Error:", error);
        }
}

const showDetails = async () => {
    const token = localStorage.getItem("token");
    const pathParts = window.location.pathname.split("/");
    let communityId;

    if (pathParts.length === 3 && pathParts[1] === "communities") {
        communityId = pathParts[2];
    }

    const buttonSub = document.getElementById("btnSub");
    const buttonCreate = document.getElementById("btnCreate");
    const countSub = document.getElementById("countSub");
    buttonSub.addEventListener("click", () => {
        handleButtonClick(communityId, buttonSub, countSub);
        
    });
    // getInfCommunity(communityId);

    let role = "";

    if (token) {
        role = await loadComunityRole(communityId, token);
    }

    if (role != "") {
        if (role == "Administrator") {
            buttonSub.classList.add("d-none");
            buttonCreate.classList.remove("d-none");
        }
        else if (role == "Subscriber") {
            buttonSub.textContent = "Отписаться";
            buttonSub.classList.remove("btn-primary");
            buttonSub.classList.add("btn-danger");
        }

    } else {
        buttonCreate.classList.add("d-none");
    }
    await getInfCommunity(communityId, role);
};

const loadTags = async () => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/tag`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            const scrollContainer = document.getElementById("scrollContainer");
            scrollContainer.innerHTML = "";

            const params = new URLSearchParams(window.location.search);
            const selectedTagsFromURL = params.getAll("tags");

            data.forEach(tag => {
                const tagElement = document.createElement("div");
                tagElement.textContent = tag.name;
                tagElement.id = tag.id;
                tagElement.className = "tag";

                if (selectedTagsFromURL.includes(tag.id)) {
                    tagElement.style.backgroundColor = "#007bff";
                }

                tagElement.addEventListener("click", () => handleTagClick(tagElement, tag.id));
                scrollContainer.appendChild(tagElement);
              });
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

export const checkAutorize = async () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem("typeCommunity");
    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
    } else {
        document.getElementById("emailBtn").classList.add("d-none");
    }
    await loadTags();
    await showDetails();
}
await checkAutorize();