import { dateConversion } from "/js/createDateTime.js";
import { showNotification } from "/js/noAuthorizeRep.js";
import { checkValidation } from "/js/validation.js";

const urlPath = (path, params) => {
    return `${path}?${params.toString()}`;
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
            const postElement = document.getElementById("postContainer");
            const countLikes = postElement.querySelector("#countLikesInput");
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

const loadLocation = async (addressId) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/address/chain?objectGuid=${addressId}`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            let fullLocation = "";
            let count = data.length;
            data.forEach(location => {
                count--;
                if (location.text == "обл Томская") {
                    fullLocation += "Томская область";
                } else {
                    fullLocation += location.text;
                }
                if (count > 0) {
                    fullLocation += ", ";
                }
            });
            console.log("fullLocation", fullLocation);
            return fullLocation;
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const createComments = async (comment) => {
    const template = document.getElementById("comment-template");
    const commentElement = template.content.cloneNode(true);
    commentElement.querySelector(".author").textContent = comment.author;
    commentElement.querySelector(".title").textContent = comment.content;
    commentElement.querySelector(".date").textContent = await dateConversion(comment.createTime);

    if (comment.subComments.length > 0) {
        commentElement.querySelector(".answer").classList.remove("d-none");
        //await loadSubComments();
    }

    return commentElement;
};

const buttonSendClick = async (postId) => {
    const token = localStorage.getItem("token");
    const data = { content: document.getElementById("commentDescription").value };
    const infMessage = document.getElementById("createCommentMessage");
    infMessage.style.color = "red";
    
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/post/${postId}/comment`,
            {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data),
            }
        );

        if (response.status === 400) {
            const infMessage = document.getElementById("createCommentMessage");
            infMessage.style.color = "red";
            infMessage.classList.remove("d-none");
            infMessage.textContent = "Поле комментария не может быть пустым";
        } else if (response.status === 401) {
            showNotification("Вы не авторизованы", "danger");
            return;
        } 
    
        if (response.ok) {
            infMessage.classList.add("d-none");
            document.getElementById("commentDescription").value = "";
            document.getElementById("commentDescription").textContent = "";
            await loadPost(postId);
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const createPost = async (post) => {
    const postElement = document.getElementById("postContainer");
    postElement.querySelector(".author").textContent = post.author;
    postElement.querySelector(".date").textContent = await dateConversion(post.createTime);
    postElement.querySelector(".title").textContent = post.title;
    postElement.querySelector(".description").textContent = post.description;
    postElement.querySelector(".reading-time").textContent = `Время чтения: ${post.readingTime} мин.`;
    postElement.querySelector(".likes-count").textContent = post.likes;
    postElement.querySelector(".comments-count").textContent = post.commentsCount;

    if (post.communityName) {
        postElement.querySelector(".community-name").textContent = `в сообществе "${post.communityName}"`;
    }
    const heartImg = postElement.querySelector(".heartImg");
    if (heartImg) {
        heartImg.addEventListener("click", () => handleLikeClick(heartImg, post));
    }

    // const chatImg = postElement.querySelector("#chatImg");
    // if (chatImg) {
    //     chatImg.addEventListener("click", () => handleChatClick(post));
    // }
    if (post.image) {
        postElement.querySelector("#image").src = post.image;
    } else {
        postElement.querySelector("#image").classList.add("d-none");
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

    if (post.addressId) {
        postElement.querySelector(".create-location").textContent = await loadLocation(post.addressId);
    } else {
        postElement.querySelector(".create-location").textContent = "Местоположение неизвестно |-_-|"
    }

    return postElement;
};

const loadPost = async (postId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/post/${postId}`,
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
            let commentContainer = document.getElementById("commentContainer");
            commentContainer.innerHTML = "";
    
            await createPost(data);

            if (data.comments.length > 0) {
                for (const comment of data.comments) {
                    let commentElement = await createComments(comment);
                    commentContainer.appendChild(commentElement);
                }
            }
            const commentElement = document.getElementById("createComment");
            const sendButton = commentElement.querySelector("#btnCreate");
            sendButton.onclick = null;
            sendButton.onclick = () => buttonSendClick(data.id);
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const checkAutorize = async () => {
    const token = localStorage.getItem("token");
    const postId = localStorage.getItem("postId");
    localStorage.removeItem("typeCommunity");
    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
    } else {
        document.getElementById("emailBtn").classList.add("d-none");
    }
    await loadPost(postId);
}
await checkAutorize();