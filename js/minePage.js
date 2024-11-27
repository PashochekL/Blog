import { dateConversion } from "/js/createDateTime.js";

const countPostPage = 5;


const createPost = async (post) => {
    let postElement = document.createElement("div");
    postElement.innerHTML = `
        <form class="p-3 border mt-3">
            <div class="row">
                <div>
                    <label class="form-label">${post.author} - </label>
                    <label class="form-label">${await dateConversion(post.readingTime)} </label>
                    <label class="form-label">в сообществе </label>
                    <label class="form-label">"${post.communityName}"</label>
                </div>
                <div>
                    <h4><label>${post.title}</label><h4><hr>
                </div>
                <div id="imageContainer" class="d-flex justify-content-center">
                    <label id="imageId" class="img-fluid mb-3"></label>
                </div>
                <div>
                    <label for="descriptions" class="form-label">${post.description}</label>
                </div>
                <div>
                    <div id="hashtagsContainer" class="hashtags-container" style="cursor: pointer;"></div>
                </div>
                <div>
                    <label for="readTime" class="form-label mt-1">Время чтения: ${post.readingTime} мин.</label>
                </div><hr>
                <div class="col">
                    <div class="row gap-2">
                        <label class="col-1">${post.commentsCount}</label>
                        <label class="col-10"></label>
                        <label class="col-1 me-0" style="width: 50px;">${post.likes}</label>
                    </div>
                </div>
            </div>
        </form>
    `;

    if (post.image) {
        const imageElement = postElement.querySelector("#imageId");
        const imgTag = document.createElement("img");
        imgTag.src = post.image;
        imageElement.appendChild(imgTag);
    }
    else {
        const container = postElement.querySelector("#imageContainer");
        container.remove();
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
        hashtagsContainer.textContent = "Нет хэштегов";
    }

    return postElement;
};

const loadPosts = async (page) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/post?page=${page}&pageSize=${countPostPage}`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();
    
            let postContainer = document.getElementById("postContainer");
            console.log(data);
    
            for (let post of data.posts) {
                let postElement = await createPost(post);
                
                postContainer.appendChild(postElement);
            }
            const countPosts = document.getElementById("countPostOnPage");
            countPosts.value = 5;
        }
    }
    catch (error) {
        console.log("Error:", error);
    }
}

loadPosts(1);