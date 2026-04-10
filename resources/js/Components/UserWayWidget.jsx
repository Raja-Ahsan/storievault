import { useEffect } from "react";

const UserWayWidget = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.setAttribute("src", "https://cdn.userway.org/widget.js");
    script.setAttribute("data-account", "ym3oQJSTuF");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
};

export default UserWayWidget;