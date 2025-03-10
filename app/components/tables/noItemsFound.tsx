import {HardHat, TentTree} from "lucide-react";
import React from "react";

export default function NoItemsFound({message = "This table seems to be empty", logo: Logo = TentTree}:{message?: string, logo?: React.ElementType}) {

    return(
        <div className="flex items-center justify-center w-full h-full">
            <Logo />
            <p className="pl-2">{message}</p>
        </div>
    );
}
