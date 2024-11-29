import { dateConversion } from "/js/createDateTime.js";
import { showNotification } from "/js/noAuthorizeRep.js";

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
            params.append("tags", tag); // подумать как снова выделять тэги после обновления
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
        document.getElementById("customCheck").checked = true; // уточнить при невыбранном пустом чекбоксе у моих групп стоит ли сразу выводить false или нет?
    } else if (state.onlyMyCommunities === false) {
        params.set("onlyMyCommunities", "false");
        document.getElementById("customCheck").checked = false;
    } //params.set("onlyMyCommunities", state.onlyMyCommunities ? "true" : "false"); //??????
    if (state.page) params.set("page", state.page);
    if (state.size) params.set("size", state.size);

    currentPage = state.page;
    countPostPage = state.size;

    const baseURL = urlPath("http://localhost:5173/", params);

    window.history.pushState({}, "", baseURL); 
  
    const url = urlPath("https://blog.kreosoft.space/api/post", params);
  
    return url;
};

const getCurrentURL = () => {
    return new URLSearchParams(window.location.search);
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
    console.log("Выбранные теги:", selectedTags);
};

const handleLikeClick = (postElement, data) => {
    const token = localStorage.getItem("token");
    if (token !== null) {
        const heartImage = postElement.querySelector("#heartImg");
        const countLikes = postElement.querySelector("#countLikesInput span");
        
        if (heartImage.classList.contains("bi-heart")) {
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
    }
    else {
        showNotification("Вы не авторизованы", "danger");
    }
}

const handleChatClick = (data) => {
    console.log("Чат кликнут", data);
}

const createPost = async (post) => {
    let postElement = document.createElement("div");
    postElement.innerHTML = `
        <form class="border-top border-start border-end mt-3">
            <div class="row">
                <div>
                    <label class="form-label p-2 ps-3 pe-0 mt-2">${post.author}  -</label>
                    <label class="form-label">${await dateConversion(post.createTime)} </label>
                    <label class="form-label">в сообществе </label>
                    <label class="form-label">"${post.communityName}"</label>
                </div>
                <div>
                    <h4><label class="p-2 ps-3">${post.title}</label><h4><hr class="mx-3">
                </div>
                <div class="ms-3 pe-5 mt-1 mb-1">
                    <label for="descriptions" class="form-label">${post.description}</label>
                </div>
                <div class="ms-3 mt-1">
                    <div id="hashtagsContainer" class="hashtags-container" style="cursor: pointer;"></div>
                </div>
                <div class="ms-3 mt-1">
                    <label for="readTime" class="form-label mt-1">Время чтения: ${post.readingTime} мин.</label>
                </div>
                <div>
                    <div class="col border p-0" style="background: #f5f5f5; height: 30px;">
                        <div class="row">
                            <label class="col-1 ps-4">
                                ${post.commentsCount}
                                <i class="bi bi-chat-left-text" id="chatImg"></i>
                            </label>
                            <label class="col-10"></label>
                            <label class="col-1 p-0">
                                <div class="me-3 ps-4">
                                    <i id="countLikesInput"><span style="font-size: 1.0rem;"">${post.likes}</span></i>
                                    <i class="bi bi-heart" id="heartImg"></i>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `;

    const heartImg = postElement.querySelector("#heartImg");
    const chatImg = postElement.querySelector("#chatImg");
    heartImg.addEventListener("click", () => handleLikeClick(postElement, post));
    chatImg.addEventListener("click", () => handleChatClick(post));

    if (post.hasLike) {
        const heartImage = postElement.querySelector("#heartImg");
        heartImage.classList.remove("bi-heart");
        heartImage.classList.add("bi-heart-fill");
        heartImage.style.filter = "invert(42%) sepia(99%) saturate(6442%) hue-rotate(0deg) brightness(98%) contrast(102%)";
    }

    const hashtagsContainer = postElement.querySelector("#hashtagsContainer");
    if (post.tags && post.tags.length > 0) {
        post.tags.forEach((tags) => {
            let hashtagElement = document.createElement("a");
            hashtagElement.className = "text me-2 text-decoration-none";
            hashtagElement.textContent = `#${tags.name}`;
            hashtagsContainer.appendChild(hashtagElement);
        });
    } else {
        //hashtagsContainer.textContent = "Нет хэштегов";
    }

    return postElement;
};

const loadPosts = async (url) => {
    console.log("fdhgjfdgjdfngjkfbnghjkf", countPostPage);
    console.log("url:", url);

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
    const params = getCurrentURL();
    params.set("page", newPage);
    const baseURL = urlPath("http://localhost:5173/", params);

    window.history.pushState({}, "", baseURL); 

    currentPage = newPage;
    console.log(currentPage);
  
    const url = urlPath("https://blog.kreosoft.space/api/post", params);

    await loadPosts(url);
};

const renderPagination = async () => {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";
    console.log("текущая страница внутри пагинации:", currentPage);

    const ul = document.createElement("ul");
    ul.classList.add("pagination", "pagination-sm");

    const prevLi = document.createElement("li");
    prevLi.classList.add("page-item");

    if (currentPage === 1) {
        prevLi.classList.add("disabled");
    }

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
        if (i === currentPage) {
            pageLi.classList.add("active");
        }

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

    if (currentPage === totalPages) {
        nextLi.classList.add("disabled");
    }

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
    const params = getCurrentURL();
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

    const params = getCurrentURL();
    const page = params.get("page");
    const size = params.get("size");


    

    //params.delete("tags");

    if (selectedTags && selectedTags.length > 0) {
        selectedTags.forEach(tag => {
            newParams.append("tags", tag);
            //console.log("TEEEEEEEEEEEEEEEEEEEEEEEG", newParams.get("tags"))
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
        document.getElementById("authorsPage").classList.remove("d-none");
        document.getElementById("comunitiesPage").classList.remove("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
        document.getElementById("btnCreate").classList.remove("d-none");
    }
    else {
        document.getElementById("btnCreate").classList.add("d-none");
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
            console.log(data);
            const scrollContainer = document.getElementById("scrollContainer");
            scrollContainer.innerHTML = "";

            const params = getCurrentURL();
            const selectedTagsFromURL = params.getAll("tags");

            data.forEach(tag => {
                const tagElement = document.createElement("div");
                tagElement.textContent = tag.name;
                tagElement.id = tag.id;
                tagElement.className = "tag";

                if (selectedTagsFromURL.includes(tag.id)) {
                    tagElement.style.backgroundColor = "#007bff"; // цвет фона для выделенного тега
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