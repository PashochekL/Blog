export const loadComunityRole = async (id, token) => {
    try {
        const response = await fetch(
            `https://blog.kreosoft.space/api/community/${id}/role`,
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
            console.log("ROLE:", data);

            return data;
        }
    } catch (error) {
        console.log("Error:", error);
    }
};