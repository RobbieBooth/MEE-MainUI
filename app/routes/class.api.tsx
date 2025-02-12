import { json } from "@remix-run/node";
import {getOrCreateUsersByEmails} from "~/db/userService";
import { sendClassToSpring } from "~/utils/springClient";
import {authenticate, authenticator} from "~/auth.server";

export const action = async ({ request }: { request: Request }) => {
    const user = await authenticate(request, "/class/api");
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { id, className, classDescription, educatorEmails, studentEmails } = await request.json();
        const educators = await getOrCreateUsersByEmails(educatorEmails, user.backendJWT!);
        const students = await getOrCreateUsersByEmails(studentEmails, user.backendJWT!);

        const educatorUUIDs = educators.map((user) => user._id);
        const studentUUIDs = students.map((user) => user._id);

        // 5. Send the request to the Spring server
        await sendClassToSpring(id, className, classDescription, educatorUUIDs, studentUUIDs, user.backendJWT!);

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        console.error("Error handling class API:", error);

        return new Response(
            JSON.stringify({ success: false, error: error }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" }
            }
        );
    }
};
