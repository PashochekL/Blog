import { navigate } from "/js/routing.js";
import { checkValidation } from "/js/validation.js";
import { showNotification } from "/js/noAuthorizeRep.js";

let selectedTags = [];
const addressFields = ["regionId", "cityId", "streetId", "buildingId"];

function getLastAddressField() {
    let lastField = null;

    addressFields.forEach((fieldId) => {
        const selectElement = document.querySelector(`[name="${fieldId}"]`);
        if (selectElement && selectElement.value) {
            const newKey = "addressId";
            lastField = { [newKey]: selectElement.value };
        }
    });
    return lastField;
}

const createPost = async (url) => {
    const infMessage = document.getElementById("createPostMessage");
    const formData = new FormData(document.getElementById("createField"));
    infMessage.style.color = "red";

    const data = Object.fromEntries(formData.entries());
    console.log("selectedTags", selectedTags);

    addressFields.forEach(field => {
        delete data[field];
    });

    const lastAddressField = getLastAddressField();
    if (lastAddressField) {
        Object.assign(data, lastAddressField);
    }

    if (data.image === "") {
        delete data.image;
        console.log("555555555555555555", data)
    }

    data.tags = selectedTags;
    console.log("datadatadatadata", data);

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
        const response = await fetch(url,
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

document.getElementById("btnCreate").addEventListener("click", () => {
    const communitySelect = document.getElementById("chooseComunity");
    const selectedOption = communitySelect.options[communitySelect.selectedIndex];
    console.log("selectedOption", selectedOption.value);
    const comId = selectedOption.value
    console.log("comId:", comId);
    if (selectedOption.value) {
        console.log(1111);
        createPost(`https://blog.kreosoft.space/api/community/${comId}/post`);
    }
    else {
        createPost("https://blog.kreosoft.space/api/post");
    }
});

const loadHouse = async (streetId) => {
    console.log("loadHouse");
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/address/search/?parentObjectId=${streetId}`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(data);

            if (data.length === 0) {
                const buildingElement  = document.getElementById("building");
                buildingElement.classList.add('d-none');
                return;
            }

            const buildingElement  = document.getElementById("building");
            const scrollContainer = document.getElementById("chooseBuilding");

            buildingElement.classList.remove('d-none');

            data.forEach(building => {
                const buildingElement = document.createElement("option");
                buildingElement.textContent = building.text;
                buildingElement.id = building.objectId;
                buildingElement.value = building.objectGuid;
                buildingElement.className = building.objectLevelText;
                scrollContainer.appendChild(buildingElement);
            });

        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const loadStreet = async (cityId) => {
    console.log("loadStreet");
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/address/search/?parentObjectId=${cityId}`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const streetElement  = document.getElementById("street");
            const scrollContainer = document.getElementById("chooseStreet");

            streetElement.classList.remove('d-none');

            data.forEach(street => {
                const streetElement = document.createElement("option");
                streetElement.textContent = street.text;
                streetElement.id = street.objectId;
                streetElement.value = street.objectGuid;
                streetElement.className = street.objectLevelText;
                scrollContainer.appendChild(streetElement);
            });

        }
    } catch (error) {
        console.log("Error:", error);
    }
};

document.getElementById("chooseStreet").addEventListener("change", async () => {
    const streetElement  = document.getElementById("street");
    const scrollContainer = document.getElementById("chooseStreet");
    const scrollBuilding = document.getElementById("chooseBuilding");
    const selectedStreet = scrollContainer.options[scrollContainer.selectedIndex];
    streetElement.querySelector("label").textContent = selectedStreet.className || "Следующий элемент адреса";
    if (selectedStreet.id) {
        const buildingElement = document.getElementById("building");
        buildingElement.querySelector("label").textContent = "Следующий элемент адреса";

        while (scrollBuilding.firstChild) {
            scrollBuilding.removeChild(scrollBuilding.firstChild);
        }

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Не выбран";
        scrollBuilding.appendChild(defaultOption);

        await loadHouse(selectedStreet.id);
    } else {
        while (scrollBuilding.firstChild) {
            scrollBuilding.removeChild(scrollBuilding.firstChild);
        }

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Не выбран";
        scrollBuilding.appendChild(defaultOption);

        document.getElementById("building").classList.add('d-none');
    }
});

const loadCity = async (regionId) => {
    console.log("loadCity");
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/address/search/?parentObjectId=${regionId}`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const cityElement  = document.getElementById("city");
            const scrollContainer = document.getElementById("chooseCity");

            cityElement.classList.remove('d-none');

            data.forEach(city => {
                const cityElement = document.createElement("option");
                cityElement.textContent = city.text;
                cityElement.id = city.objectId;
                cityElement.value = city.objectGuid;
                cityElement.className = city.objectLevelText;
                scrollContainer.appendChild(cityElement);
            });

        }
    } catch (error) {
        console.log("Error:", error);
    }
};

document.getElementById("chooseCity").addEventListener("change", async () => {
    const cityElement  = document.getElementById("city");
    const scrollContainer = document.getElementById("chooseCity");
    const scrollStreet = document.getElementById("chooseStreet");
    const scrollBuilding = document.getElementById("chooseBuilding");
    const selectedCity = scrollContainer.options[scrollContainer.selectedIndex];
    cityElement.querySelector("label").textContent = selectedCity.className;
    if (!cityElement.querySelector("label").textContent) {
        cityElement.querySelector("label").textContent = "Следующий элемент адреса";
    }
    if (selectedCity.id) {
        const streetElement  = document.getElementById("street");
        streetElement.querySelector("label").textContent = "Следующий элемент адреса";
        while (scrollStreet.firstChild) {
            scrollStreet.removeChild(scrollStreet.firstChild);
        }
        while (scrollBuilding.firstChild) {
            scrollBuilding.removeChild(scrollBuilding.firstChild);
        }

        const defaultStreetOption = document.createElement("option");
        defaultStreetOption.value = "";
        defaultStreetOption.textContent = "Не выбран";
        scrollStreet.appendChild(defaultStreetOption);

        const defaultBuildingOption = document.createElement("option");
        defaultBuildingOption.value = "";
        defaultBuildingOption.textContent = "Не выбран";
        scrollBuilding.appendChild(defaultBuildingOption);
        document.getElementById("building").classList.add('d-none');

        await loadStreet(selectedCity.id);
    } else {
        const streetElement  = document.getElementById("street");
        streetElement.querySelector("label").textContent = "Следующий элемент адреса";

        while (scrollStreet.firstChild) {
            scrollStreet.removeChild(scrollStreet.firstChild);
        }
        while (scrollBuilding.firstChild) {
            scrollBuilding.removeChild(scrollBuilding.firstChild);
        }

        const defaultStreetOption = document.createElement("option");
        defaultStreetOption.value = "";
        defaultStreetOption.textContent = "Не выбран";
        scrollStreet.appendChild(defaultStreetOption);

        const defaultBuildingOption = document.createElement("option");
        defaultBuildingOption.value = "";
        defaultBuildingOption.textContent = "Не выбран";
        scrollBuilding.appendChild(defaultBuildingOption);

        document.getElementById("street").classList.add('d-none');
        document.getElementById("building").classList.add('d-none');
    }
});

const loadRegion = async () => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/address/search`,
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            const scrollContainer = document.getElementById("chooseRegion");

            data.forEach(region => {
                const regionElement = document.createElement("option");
                regionElement.textContent = region.text;
                regionElement.id = region.objectId;
                regionElement.value = region.objectGuid;
                regionElement.className = "region";
                scrollContainer.appendChild(regionElement);
            });

        }
    } catch (error) {
        console.log("Error:", error);
    }
};

document.getElementById("chooseRegion").addEventListener("change", async () => {
    const scrollContainer = document.getElementById("chooseRegion");
    const scrollCity = document.getElementById("chooseCity");
    const scrollStreet = document.getElementById("chooseStreet");
    const scrollBuilding = document.getElementById("chooseBuilding");
    const selectedRegion = scrollContainer.options[scrollContainer.selectedIndex];
    if (selectedRegion.id) {
        await loadCity(selectedRegion.id);
    } else {
        const cityElement  = document.getElementById("city");
        cityElement.querySelector("label").textContent = "Следующий элемент адреса";

        while (scrollCity.firstChild) {
            scrollCity.removeChild(scrollCity.firstChild);
        }
        while (scrollStreet.firstChild) {
            scrollStreet.removeChild(scrollStreet.firstChild);
        }
        while (scrollBuilding.firstChild) {
            scrollBuilding.removeChild(scrollBuilding.firstChild);
        }
        const defaultCityOption = document.createElement("option");
        defaultCityOption.value = "";
        defaultCityOption.textContent = "Не выбран";
        scrollCity.appendChild(defaultCityOption);

        const defaultStreetOption = document.createElement("option");
        defaultStreetOption.value = "";
        defaultStreetOption.textContent = "Не выбран";
        scrollStreet.appendChild(defaultStreetOption);

        const defaultBuildingOption = document.createElement("option");
        defaultBuildingOption.value = "";
        defaultBuildingOption.textContent = "Не выбран";
        scrollBuilding.appendChild(defaultBuildingOption);
        
        document.getElementById("street").classList.add('d-none');
        document.getElementById("building").classList.add('d-none');
        document.getElementById("city").classList.add('d-none');
    }
});

const handleTagClick = (tagElement, tagId) => {
    if (selectedTags.includes(tagId)) {
        selectedTags = selectedTags.filter(tag => tag !== tagId);
        tagElement.style.backgroundColor = "";
    } else {
        selectedTags.push(tagId);
        tagElement.style.backgroundColor = "#007bff";
    }
};

const getCommunities = async () => {
    try {
        const response = await fetch(
            "https://blog.kreosoft.space/api/community",
            {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                }
            }
        );
    
        if (response.ok) {
            const data = await response.json();

            return data;
        }
    } catch (error) {
        console.log("Error:", error);
    }
};

const loadCommunities = async (token) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/my`,
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
            const scrollContainer = document.getElementById("chooseComunity");

            const communities = await getCommunities();
            data.forEach(community => {
                if (community.role == "Administrator") {
                    const communityElement = document.createElement("option");
                    if (community.communityId == communities[0].id) {
                        communityElement.textContent = communities[0].name;
                        communityElement.id = community.id;
                        communityElement.value = community.communityId;
                        communityElement.className = "community";
                        scrollContainer.appendChild(communityElement);
                    } else if (community.communityId == communities[1].id) {
                        communityElement.textContent = communities[1].name;
                        communityElement.id = community.id;
                        communityElement.value = community.communityId;
                        communityElement.className = "community";
                        scrollContainer.appendChild(communityElement);
                    } else {
                        communityElement.textContent = communities[2].name;
                        communityElement.id = community.id;
                        communityElement.value = community.communityId;
                        communityElement.className = "community";
                        scrollContainer.appendChild(communityElement);
                    }
                }
            });
        }
    } catch (error) {
        console.log("Error:", error);
    }
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

const checkAutorize = async () => {
    const token = localStorage.getItem("token");

    if (token) {
        document.getElementById("emailBtn").classList.remove("d-none");
        document.getElementById("loginBtn").classList.add("d-none");
        document.getElementById("emailBtn").textContent = localStorage.getItem("userEmail");
        loadTags(token);
        const communityName = localStorage.getItem("communityName");
        console.log(communityName);
        if (communityName) {
            const selectElement = document.getElementById("chooseComunity");
            const option = selectElement.querySelector("option");
            option.textContent = communityName;
        }
        else {
            await loadCommunities(token);
        }
        await loadRegion();
    }
    else {
        showNotification("Время действия на странице завершено", "danger")
        navigate("/login");
    }
}

checkAutorize();