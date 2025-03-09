import {TentTree} from "lucide-react";

export default function NoItemsFound({message = "This table seems to be empty"}:{message?: string}) {

    return(
        <div className="flex items-center justify-center w-full h-full">
            <TentTree />
            <p className="pl-2">{message}</p>
        </div>
    );
}