import { useLayoutEffect } from "react";

export const MountCallback = ({callback, children}) => {
    useLayoutEffect(() => {
        callback?.();
        // Initialize page timings
        var pageTimings = window._pageTimings || (window._pageTimings = {});

        // Collect perf metrics from page and add them to pageTimings object
        performance.getEntriesByType('mark').forEach(perfMark =>{
            if (perfMark.name.indexOf('TTVR') >= 0){
                pageTimings[perfMark.name] = Math.round(perfMark.startTime);
    }
});
    }, [callback]);
    return <>{children}</>;
};