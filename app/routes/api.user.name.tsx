import {authenticate} from "~/auth.server";
import {getOrCreateUsersByEmails, getUsersDetailsByIds} from "~/db/userService";
import {sendClassToSpring} from "~/utils/springClient";

export const action = async ({ request }: { request: Request }) => {
    console.log("Authenticated User:", request);
    const user = await authenticate(request, "/api/user/name");
    console.log("Authenticated User:", user);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { userUUIDs } = await request.json();
        const uuidToName = await getUsersDetailsByIds(userUUIDs);

        console.log("User UUID:", uuidToName);
        return new Response(
            JSON.stringify({success: true, users: Object.fromEntries(uuidToName)}),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Error handling user API:", error);

        return new Response(
            JSON.stringify({ success: false, error: error }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};