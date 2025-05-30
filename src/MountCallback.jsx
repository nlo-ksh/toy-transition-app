import { useLayoutEffect } from "react";

export const MountCallback = ({callback, children}) => {
    useLayoutEffect(() => {
        callback?.();
    }, [callback]);
    return <>{children}</>;
};