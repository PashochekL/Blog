import { dateConversion } from "/js/createDateTime.js";
import { showNotification } from "/js/noAuthorizeRep.js";
import { navigate } from "/js/routing.js";

let countPostPage = 5;
let currentPage = 1;
let totalPages = 0;
let selectedTags = [];

const urlPath = (path, params) => {
    return `${path}?${params.toString()}`;
};

const createURL = (state) => {
    const params = new URLSearchParams();

    console.log(selectedTags);
  
    if (state.author) {
        params.set("author", state.author);
        document.getElementById("searchByName").value = state.author;
    }
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
    if (state.min) {
        params.set("min", state.min);
        document.getElementById("readingTimeFrom").value = state.min;
    }
    if (state.max) {
        params.set("max", state.max);
        document.getElementById("readingTimeTo").value = state.max;
    }
    if (state.onlyMyCommunities === true) {
        params.set("onlyMyCommunities", "true");
        document.getElementById("customCheck").checked = true;
    }
    if (state.page) params.set("page", state.page);
    if (state.size) params.set("size", state.size);

    currentPage = state.page;
    countPostPage = state.size;

    const baseURL = urlPath("http://localhost:5173/", params);
    window.history.pushState({}, "", baseURL); 
    const url = urlPath("https://blog.kreosoft.space/api/post", params);
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

const getStartURL = () => {
    const params = new URLSearchParams(window.location.search);

    console.log(window.location.search);
    console.log("СТЫРТОВЫЕ ТЕГИИИИ", params.getAll("tags"))
    return {
        author: params.get("author") || "",
        tags: params.has("tags") ? params.getAll("tags") : [],
        sorting: params.get("sorting") || null,
        min: params.get("min") || null,
        max: params.get("max") || null,
        onlyMyCommunities: params.get("onlyMyCommunities") === "true",
        page: parseInt(params.get("page"), 10) || 1,
        size: parseInt(params.get("size"), 10) || 5,
    };
};

const handleTagClick = (tagElement, tagId) => {
    if (selectedTags.includes(tagId)) {
        selectedTags = selectedTags.filter(tag => tag !== tagId);
        tagElement.style.backgroundColor = "";
    } else {
        selectedTags.push(tagId);
        tagElement.style.backgroundColor = "#007bff";
    }
};

const titleClick = (post) => {
    localStorage.setItem("postId", post.id);
    navigate(`/post/${post.id}`)
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

const handleChatClick = (data) => {
    console.log("Чат кликнут", data);
}

const createPost = async (post) => {
    const template = document.getElementById("post-template");
    const postElement = template.content.cloneNode(true);

    postElement.querySelector(".author").textContent = post.author;
    postElement.querySelector(".date").textContent = await dateConversion(post.createTime);
    postElement.querySelector(".title").textContent = post.title;
    postElement.querySelector(".title").addEventListener("click", () => titleClick(post))
    postElement.querySelector(".description").textContent = post.description;
    postElement.querySelector(".reading-time").textContent = `Время чтения: ${post.readingTime} мин.`;
    postElement.querySelector(".likes-count").textContent = post.likes;
    postElement.querySelector(".likes-count").id = post.id;
    postElement.querySelector(".comments-count").textContent = post.commentsCount;

    if (post.communityName) {
        postElement.querySelector(".community-name").textContent = `в сообществе "${post.communityName}"`;
    }

    const heartImg = postElement.querySelector(".heartImg");
    if (heartImg) {
        heartImg.addEventListener("click", () => handleLikeClick(heartImg, post));
    }

    const chatImg = postElement.querySelector("#chatImg");
    if (chatImg) {
        chatImg.addEventListener("click", () => handleChatClick(post));
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
            hashtagElement.className = "text me-2 text-decoration-none";
            hashtagElement.textContent = `#${tags.name}`;
            hashtagsContainer.appendChild(hashtagElement);
        });
    }

    const nameForSearch = localStorage.getItem("searchToAuthorName");

    if (nameForSearch) {
        const inputname = document.getElementById("searchByName");
        inputname.value = nameForSearch
        localStorage.removeItem("searchToAuthorName");
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
            console.log(data);
            totalPages = data.pagination.count;

            let postContainer = document.getElementById("postContainer");
            postContainer.innerHTML = "";
    
            for (let post of data.posts) {
                let postElement = await createPost(post);
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
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage);
    const baseURL = urlPath("http://localhost:5173/", params);
    window.history.pushState({}, "", baseURL); 
    currentPage = newPage;
    const url = urlPath("https://blog.kreosoft.space/api/post", params);
    await loadPosts(url);
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

const updateSize = async (newSize) => {
    const params = new URLSearchParams(window.location.search);
    params.set("size", newSize);
    const baseURL = urlPath("http://localhost:5173/", params);
    window.history.pushState({}, "", baseURL); 
    const url = urlPath("https://blog.kreosoft.space/api/post", params);
    await loadPosts(url);
};

const renderCountElement = async () => {
    const countPost = document.getElementById("countPostOnPage");
    countPostPage = parseInt(countPost.value, 10);
    await updateSize(countPostPage);
};

document.getElementById("countPostOnPage").addEventListener("change", renderCountElement);

const checkParams = async () => {
    const newParams = new URLSearchParams();
    const author = document.getElementById("searchByName");
    const sort = document.getElementById("inputSort");
    const timeFrom = document.getElementById("readingTimeFrom");
    const timeTo = document.getElementById("readingTimeTo");
    const checkMinePost = document.getElementById("customCheck");

    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    const size = params.get("size");

    if (selectedTags && selectedTags.length > 0) {
        selectedTags.forEach(tag => {
            newParams.append("tags", tag);
        });
    }
    if (author.value) newParams.append("author", author.value);
    if (sort.value) newParams.append("sorting", sort.value);
    if (timeFrom.value) newParams.append("min", timeFrom.value);
    if (timeTo.value) newParams.append("max", timeTo.value);

    newParams.append("onlyMyCommunities", checkMinePost.checked ? "true" : "false");
    newParams.append("page", page);
    newParams.append("size", size);

    const baseURL = urlPath("http://localhost:5173/", newParams);
    window.history.pushState({}, "", baseURL); 

    const url = urlPath("https://blog.kreosoft.space/api/post", newParams);
    await loadPosts(url);
};

document.getElementById("btnApply").addEventListener("click", checkParams);

const loadPageContext = async () => {
    const token = localStorage.getItem("token");
    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
        document.getElementById("btnCreate").classList.remove("d-none");
        document.getElementById("btnCreate").addEventListener("click", () => navigate("/post/create"))
    } else {
        document.getElementById("btnCreate").classList.add("d-none");
        document.getElementById("emailBtn").classList.add("d-none");
    }
    await loadTags(token);
    const params = getStartURL();

    const onlyMyCommunitiesCheckbox = document.getElementById("customCheck");
    onlyMyCommunitiesCheckbox.checked = params.onlyMyCommunities;
    
    const url = createURL(params);
    await loadPosts(url);
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

await loadPageContext();