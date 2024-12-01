export const dateConversion = async (dataTime) => {
    const date = new Date(dataTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    return formattedDate;
};

export const convertOnlyDate = async (dataTime) => {
    const date = new Date(dataTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    const formattedDate = `${day}-${month}-${year}`;
    
    return formattedDate;
}