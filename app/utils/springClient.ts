export const sendClassToSpring = async (
    id: string,
    className: string,
    classDescription: string,
    educators: string[],
    students: string[],
    jwt: string,
): Promise<Response> => {
    const queryParams = new URLSearchParams({ className, classDescription });
    const response = await fetch(`http://localhost:8080/v1/api/class/edit/${id}?${queryParams.toString()}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`, // Include auth token
        },
        body: JSON.stringify({className, classDescription, educators, students }),
    });

    if (!response.ok) {
        throw new Error(`Failed to send class to Spring server: ${response.statusText}`);
    }

    return response;
};
