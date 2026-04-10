import React from "react";
import videoLoader from "@/assets/videos/logo-animated-new.mp4";

const Index = ({ loading }) => {
    if (!loading) return null;

    return (
        <div
            className="loader-wrapper"
            style={{ width: "100%", height: "100%", overflow: "hidden" }}
        >
            {/* add video loader  */}
            <video src={videoLoader} autoPlay loop muted />
        </div>
    );
};

export default Index;
