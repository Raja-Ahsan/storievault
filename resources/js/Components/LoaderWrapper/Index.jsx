import { useState, useEffect } from "react";
import Loader from "../Loader/Index";

export default function LoaderWrapper({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000); // 2 sec
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Loader loading={loading} />
            {!loading && children}
        </>
    );
}
