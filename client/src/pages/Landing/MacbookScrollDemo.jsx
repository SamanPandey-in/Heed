import React from "react";
import { MacbookScroll } from "./macbook-scroll";

export default function MacbookScrollDemo() {
    return (
        <div className="w-full overflow-hidden bg-white dark:bg-black">
            <MacbookScroll
                title={
                    <span className="text-zinc-800 dark:text-white">
                        Stop Reacting. <br /> Start Heeding.
                    </span>
                }
                badge={
                    <div className="h-10 w-10 -rotate-12 transform bg-white dark:bg-white/10 rounded-full flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-xl">
                        <span className="text-[10px] font-bold text-black dark:text-white">HEED</span>
                    </div>
                }
                src={`/preview.png`}
                showGradient={false}
            />
        </div>
    );
}