import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
// import '@/assets/styles/story-modal.css';
import UserAvatar from "./UserAvatar";
import { Icons } from "../../utils/icons";
import LoginPromptModal from "@/Components/stories/LoginPromptModal";

const Header = ({ logoClass, headerClass }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { url } = usePage();
    const { auth, categories } = usePage().props;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Check if the current URL matches the link
    const isActive = (path) => {
        return url.startsWith(path);
    };

    const handleCloseLoginPrompt = () => {
        setShowLoginPrompt(false);
    };
    return (
        <header className={`position-absolute top-0 w-100 z-3 ${headerClass}`}>
            <div className="container px-2 px-md-3 px-lg-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="flex-shrink-0">
                        <div className="logo">
                            <Link href="/">
                                <img
                                    src="/assets/images/logo.webp"
                                    alt="logo"
                                    className="img-fluid"
                                    style={{
                                        maxWidth: "200px",
                                        width: "100%",
                                        height: "auto",
                                    }}
                                />
                            </Link>
                        </div>
                    </div>
                    <div
                        className="d-none d-lg-block flex-shrink-1"
                        style={{ minWidth: 0, flex: "1 1 auto" }}
                    >
                        <nav>
                            <ul
                                className={`d-flex primary-navs align-items-center justify-content-center ${isMenuOpen ? "active" : ""}`}
                                style={{ gap: "clamp(10px, 2vw, 40px)" }}
                            >
                                <li>
                                    <Link href="/">Home</Link>
                                </li>

                                <li className="dropdown">
                                    <Link
                                        href="/stories"
                                        className="dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        id="storiesDropdown"
                                    >
                                        Stories
                                    </Link>
                                    <ul
                                        className="dropdown-menu user-dropdown stories-dropdown"
                                        aria-labelledby="storiesDropdown"
                                    >
                                        <li>
                                            <div
                                                className="d-flex justify-content-between align-items-center"
                                                style={{
                                                    padding: "10px 20px",
                                                    gap: "10px",
                                                }}
                                            >
                                                <Link
                                                    href="/create-story"
                                                    className="user-dropdown-item text-primary fw-bold"
                                                >
                                                    Create Story
                                                </Link>

                                                <Link
                                                    href="/custom-prompt-generator"
                                                    className="user-dropdown-item text-primary fw-bold"
                                                >
                                                    Custom Prompt Generator
                                                </Link>
                                            </div>
                                        </li>

                                        <li>
                                            <hr className="dropdown-divider" />
                                        </li>

                                        {categories && categories.length > 0 ? (
                                            <div className="stories-dropdown-columns">
                                                {categories.map((category) => (
                                                    <li key={category.id}>
                                                        <Link
                                                            href={`/${category.slug}-stories`}
                                                            className="user-dropdown-item"
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </div>
                                        ) : (
                                            <li>
                                                <span className="user-dropdown-item text-muted">
                                                    No categories available
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                </li>
                                <li>
                                    <Link href="/from-the-vault">
                                        From the Vault
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/packages">Packages</Link>
                                </li>
                                <li>
                                    <Link href="/community">Community</Link>
                                </li>
                                
                                <li>
                                    <Link href="/contests">Contests</Link>
                                </li>

                                <li className="dropdown">
                                    <div className="d-flex align-items-center">
                                        <Link
                                            href="/how-it-works"
                                            className="me-1"
                                        >
                                            How It Works
                                        </Link>
                                        <span
                                            className="dropdown-toggle"
                                            style={{
                                                cursor: "pointer",
                                                color: "white",
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsHowItWorksOpen(
                                                    !isHowItWorksOpen,
                                                );
                                            }}
                                            aria-expanded={isHowItWorksOpen}
                                        ></span>
                                    </div>
                                    <ul
                                        className={`dropdown-menu user-dropdown ${isHowItWorksOpen ? "show" : ""}`}
                                        style={{
                                            backgroundColor: "#fff",
                                            padding: "10px 0",
                                            border: "1px solid #eee",
                                        }}
                                    >
                                        <li>
                                            <Link
                                                href="/about"
                                                className="user-dropdown-item"
                                                style={{
                                                    color: "#333",
                                                    padding: "8px 10px",
                                                    display: "block",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                About
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <Link href="/publish">Publish</Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div
                        className={`d-flex align-items-center justify-content-end flex-shrink-0`}
                        style={{ gap: "clamp(10px, 1.5vw, 20px)" }}
                    >
                        <div
                            className="d-none d-md-block d-flex align-items-center"
                            style={{ gap: "clamp(10px, 1.5vw, 20px)" }}
                        >
                            {!auth?.user ? (
                                <>
                                    <div className="dropdown">
                                        <button
                                            className="btn btn-primary dropdown-toggle"
                                            style={{
                                                fontSize:
                                                    "clamp(12px, 1.2vw, 18px)",
                                                whiteSpace: "nowrap",
                                            }}
                                            type="button"
                                            id="authDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            Account
                                        </button>
                                        <ul
                                            className="dropdown-menu user-dropdown dropdown-menu-end"
                                            aria-labelledby="authDropdown"
                                        >
                                            <li>
                                                <Link
                                                    href="/login"
                                                    className="user-dropdown-item"
                                                >
                                                    Sign in
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/register"
                                                    className="user-dropdown-item"
                                                >
                                                    Sign Up
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href="/guest-login"
                                                    className="user-dropdown-item"
                                                >
                                                    Guest Login
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <UserAvatar user={auth.user} className="" />
                                </>
                            )}
                        </div>
                        <div className="d-lg-none">
                            <button
                                className="btn btn-link text-white p-0"
                                onClick={toggleMenu}
                                aria-label="Toggle mobile menu"
                            >
                                <Icons.Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="d-lg-none">
                <ul
                    className={`d-flex primary-navs align-items-center justify-content-center ${isMenuOpen ? "active" : ""}`}
                >
                    <div
                        className="close-menu d-flex d-lg-none"
                        onClick={toggleMenu}
                    >
                        <Icons.Cross />
                    </div>
                    <li>
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>
                            Home
                        </Link>
                    </li>

                    <li className="dropdown">
                        <Link
                            href="/stories"
                            className="dropdown-toggle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            id="storiesDropdownMobile"
                            onClick={(e) => e.preventDefault()}
                        >
                            Stories
                        </Link>
                        <ul
                            className="dropdown-menu user-dropdown stories-dropdown"
                            aria-labelledby="storiesDropdownMobile"
                        >
                            <li>
                                <Link
                                    href="/create-story"
                                    className="user-dropdown-item text-primary fw-bold justify-content-center"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{ padding: "10px 20px" }}
                                >
                                    Create Story
                                </Link>
                                <Link
                                    href="/custom-prompt-generator"
                                    className="user-dropdown-item text-primary fw-bold justify-content-center"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{ padding: "10px 20px" }}
                                >
                                    Prompt Generator
                                </Link>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            {categories && categories.length > 0 ? (
                                <div className="stories-dropdown-columns">
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <Link
                                                href={`/${category.slug}-stories`}
                                                className="user-dropdown-item"
                                                onClick={() =>
                                                    setIsMenuOpen(false)
                                                }
                                            >
                                                {category.name}
                                            </Link>
                                        </li>
                                    ))}
                                </div>
                            ) : (
                                <li>
                                    <span className="user-dropdown-item text-muted">
                                        No categories available
                                    </span>
                                </li>
                            )}
                        </ul>
                    </li>
                    <li>
                        <Link
                            href="/from-the-vault"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            From the Vault
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/packages"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Packages
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/community"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Community
                        </Link>
                    </li>
                    
                    <li>
                        <Link
                            href="/contests"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contests
                        </Link>
                    </li>

                    <li>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Link
                                href="/how-it-works"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                How It Works
                            </Link>
                            <span
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsHowItWorksOpen(!isHowItWorksOpen);
                                }}
                                style={{
                                    cursor: "pointer",
                                    padding: "0 10px",
                                    color: "white",
                                }}
                            >
                                <i
                                    className="fas fa-chevron-down"
                                    style={{
                                        transition: "transform 0.3s",
                                        transform: isHowItWorksOpen
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                    }}
                                ></i>
                            </span>
                        </div>
                        <ul
                            style={{
                                display: isHowItWorksOpen ? "block" : "none",
                                backgroundColor: "#fff",

                                listStyle: "none",
                                borderRadius: "0.25rem",
                                boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
                            }}
                        >
                            <li>
                                <Link
                                    href="/about"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        padding: "0.5rem 1rem",
                                        clear: "both",
                                        fontWeight: "400",
                                        color: "#000",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        backgroundColor: "transparent",
                                        border: 0,
                                        fontSize: "14px",
                                    }}
                                >
                                    About
                                </Link>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <Link
                            href="/publish"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Publish
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
