import { dateConversion } from "/js/createDateTime.js";
import { showNotification } from "/js/noAuthorizeRep.js";
import { isTokenExpired } from "/js/routing.js"

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
            return fullLocation;
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const answerAdd = async (postId, idParenth, newInput) => {
    const token = localStorage.getItem("token");
    const data = {
        content: newInput.value,
        parentId: idParenth
    };
    
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
            
        } else if (response.status === 401) {
            showNotification("Вы не авторизованы", "danger");
            return;
        } 
    
        if (response.ok) {
            await loadPost(postId);
        }
    } catch (error) {
        console.log("Error:", error);
    }
}

const deleteComment = async (token, id) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/comment/${id}`,
            {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.ok) {
            loadPost(localStorage.getItem("postId"));
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const changeComment = async (token, input, id) => {
    const data = { content: input.value };

    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/comment/${id}`,
            {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data),
            }
        );

        if (response.status === 400) {
            input.style.borderColor = "red";
        }
        if (response.ok) {
            loadPost(localStorage.getItem("postId"));
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const loadSubComments = async (id, targetContainer) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/comment/${id}/tree`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();
            targetContainer.innerHTML = "";

            for (const subComment of data) {
                console.log("subComment.id", subComment.id)
                let commentElement = await createComments(subComment, 1);
                targetContainer.appendChild(commentElement);
            }

            const commentElement = document.getElementById("createComment");
            const sendButton = commentElement.querySelector("#btnCreate");
            sendButton.onclick = null;
            sendButton.onclick = () => buttonSendClick(localStorage.getItem("postId"));
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const createComments = async (comment, flag) => {
    const template = document.getElementById("comment-template");
    const commentElement = template.content.cloneNode(true);

    commentElement.querySelector(".author").textContent = comment.author;
    const title = commentElement.querySelector(".title");

    const answer = commentElement.querySelector(".answer");
    const addAnswer = commentElement.querySelector(".addAnswer");

    title.textContent = comment.content;
    if (comment.deleteDate) {
        title.textContent = "[Комментарий удален]";
        // commentElement.querySelector(".pencil").classList.add("d-none");
        // commentElement.querySelector(".trash").classList.add("d-none");
        if (comment.subComments > 0) {
            answer.classList.add("d-none");
            addAnswer.classList.add("d-none");
        }
    } else if (comment.modifiedDate) {
        const modifiedLabel = document.createElement("h6");
        modifiedLabel.textContent = "(изменен)";
        modifiedLabel.style.display = "inline";
        modifiedLabel.style.fontWeight = "normal";
        modifiedLabel.style.marginLeft = "5px";
        title.appendChild(modifiedLabel);
    }

    commentElement.querySelector(".date").textContent = await dateConversion(comment.createTime);
    const description = commentElement.querySelector(".descriptionContainer");

    const input = commentElement.querySelector(".input");
    const newInput = commentElement.querySelector(".inputNew");
    commentElement.querySelector(".sub-comments").id = `subComments-${comment.id}`;

    const subCommentsContainer = commentElement.querySelector(".sub-comments");
    subCommentsContainer.id = `subComments-${comment.id}`;
    commentElement.querySelector(".answer").id = `answerBtn-${comment.id}`

    addAnswer.id = `addAnswer-${comment.id}`;
    const addAnswerContainer = commentElement.querySelector(".addAnswerContainer");
    const addAnswerBtn = commentElement.querySelector(".addAnswerBtn");

    addAnswer.addEventListener("click", () => {
        
        if (addAnswerContainer.classList.contains("d-none")) {
            addAnswerContainer.classList.remove("d-none");
        } else {
            answer.classList.remove("d-none");
            addAnswerContainer.classList.add("d-none");
        }
    });

    addAnswerBtn.addEventListener("click", () => answerAdd(localStorage.getItem("postId"), comment.id, newInput))

    answer.addEventListener("click", () => {
        if (answer.textContent == "Расскрыть ответы") {
            answer.textContent = "Скрыть ответы"
            loadSubComments(comment.id, subCommentsContainer);
        } else {
            answer.textContent = "Расскрыть ответы";
            subCommentsContainer.innerHTML = "";
        }
    });

    if (comment.subComments == 0) {
        answer.classList.add("d-none");
    }
    if (flag == 1) {
        answer.classList.add("d-none");
    }

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId")
    if (token && !isTokenExpired(token)) {
        if (userId == comment.authorId && !comment.deleteDate) {
            commentElement.querySelector(".pencil").classList.remove("d-none");
            commentElement.querySelector(".pencil").addEventListener("click", () => {
                title.style.display = "none";
                description.classList.remove("d-none");
                input.value = title.textContent;
            })
            commentElement.querySelector(".trash").addEventListener("click", () => deleteComment(token, comment.id))
            commentElement.querySelector(".btnCreate").addEventListener("click", () => changeComment(token, input, comment.id));
            commentElement.querySelector(".pencil").style.filter = "invert(58%) sepia(79%) saturate(1333%) hue-rotate(-15deg) brightness(99%) contrast(98%)";
            commentElement.querySelector(".trash").classList.remove("d-none");
            commentElement.querySelector(".trash").style.filter = "invert(42%) sepia(99%) saturate(6442%) hue-rotate(0deg) brightness(98%) contrast(102%)";
        } else if (comment.deleteDate) {
            addAnswer.classList.add("d-none");
        }
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
    hashtagsContainer.innerHTML = '';
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
                    let commentElement = await createComments(comment, 0);
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
    console.log(localStorage.getItem("scrollToComments"));
    console.log(localStorage.getItem("postId"))
    if (localStorage.getItem("scrollToComments") === "true") {
        const commentSection = document.getElementById("commentContainer");
        commentSection.scrollIntoView({ behavior: "smooth" });
        localStorage.removeItem("scrollToComments");
    }
}
await checkAutorize();