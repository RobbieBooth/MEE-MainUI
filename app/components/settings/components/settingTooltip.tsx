import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip"
import {TooltipSetting} from "~/components/settings/compositeSettings";
import {CircleHelp} from "lucide-react";

export function SettingTooltip({tooltip}:{tooltip:string}) {
    return (
        <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <CircleHelp/>
            </TooltipTrigger>
            <TooltipContent>
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
    );
}
