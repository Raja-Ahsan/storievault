import React, { useState, useEffect } from "react";
import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { Icons } from "../utils/icons";
import "../../css/CustomPromptGenerator.css";

const CustomPromptGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [generatedPrompt, setGeneratedPrompt] = useState("");
    const [generatePromptLoading, setGeneratePromptLoading] = useState(false);
    const [generatePromptError, setGeneratePromptError] = useState("");

    // All dropdown visibility states
    const [menus, setMenus] = useState({
        genre: false,
        subGenre: false,
        pov: false,
        length: false,
        tone: false,
        timePeriod: false,
        theme: false,
    });

    const [expandedGenre, setExpandedGenre] = useState(null);

    const mainGenresList = [
        "Fantasy",
        "Science Fiction",
        "Romance",
        "Horror",
        "Mystery",
        "Thriller",
        "Historical Fiction",
        "Literary Fiction",
        "Young Adult",
        "Children’s Fiction",
        "Superhero",
        "Paranormal",
        "Comedy",
    ];

    const categories = {
        Fantasy: [
            "Epic Fantasy",
            "Dark Fantasy",
            "Urban Fantasy",
            "Sword & Sorcery",
            "Mythic Fantasy",
        ],
        "Science Fiction": [
            "Space Opera",
            "Cyberpunk",
            "Dystopian",
            "Hard Sci-Fi",
            "Time Travel",
        ],
        Romance: [
            "Contemporary Romance",
            "Romantic Comedy",
            "Dark Romance",
            "Paranormal Romance",
            "Historical Romance",
        ],
        Horror: [
            "Psychological Horror",
            "Supernatural Horror",
            "Cosmic Horror (Lovecraftian)",
            "Body Horror",
            "Slasher Horror",
            "Gothic Horror",
            "Survival Horror",
            "Folk Horror",
            "Monster Horror",
            "Occult Horror",
        ],
        Mystery: [
            "Detective Mystery",
            "Cozy Mystery",
            "Police Procedural",
            "Amateur Sleuth",
            "Whodunit",
            "Noir Mystery",
            "Legal Mystery",
            "Historical Mystery",
            "Locked Room Mystery",
            "Crime Mystery",
        ],
        Thriller: [
            "Psychological Thriller",
            "Crime Thriller",
            "Political Thriller",
            "Action Thriller",
            "Techno Thriller",
            "Spy / Espionage Thriller",
            "Legal Thriller",
            "Medical Thriller",
            "Conspiracy Thriller",
            "Survival Thriller",
        ],
        "Historical Fiction": [
            "Ancient Civilization",
            "Medieval Historical",
            "Renaissance Era",
            "War Historical",
            "Colonial Era",
            "Victorian Era",
            "Historical Romance",
            "Historical Adventure",
            "Alternate History",
            "Biographical Historical",
        ],
        "Literary Fiction": [
            "Character-Driven Fiction",
            "Contemporary Literary",
            "Experimental Fiction",
            "Philosophical Fiction",
            "Psychological Literary",
            "Social Commentary",
            "Minimalist Fiction",
            "Coming-of-Age Literary",
            "Family Saga",
            "Stream of Consciousness",
        ],
        "Young Adult": [
            "YA Fantasy",
            "YA Science Fiction",
            "YA Romance",
            "YA Dystopian",
            "YA Coming of Age",
            "YA Adventure",
            "YA Contemporary",
            "YA Mystery",
            "YA Paranormal",
            "YA Issue-Based (identity, mental health, etc.)",
        ],
        "Children\u2019s Fiction": [
            "Picture Book Style",
            "Early Reader",
            "Middle Grade",
            "Fairy Tale",
            "Fable",
            "Adventure for Kids",
            "Educational Story",
            "Animal Story",
            "Bedtime Story",
            "Magical Adventure",
        ],
        Superhero: [
            "Origin Story",
            "Vigilante Hero",
            "Antihero Story",
            "Team-Based Superheroes",
            "Cosmic Superhero",
            "Supervillain Perspective",
            "Superhero Romance",
            "Dark Superhero",
            "Superpower Discovery",
            "Alternate Universe Superhero",
        ],
        Paranormal: [
            "Ghost Story",
            "Psychic Powers",
            "Vampires",
            "Werewolves",
            "Demons / Possession",
            "Supernatural Romance",
            "Haunted Locations",
            "Urban Paranormal",
            "Afterlife Story",
            "Occult Mystery",
        ],
        Comedy: [
            "Romantic Comedy",
            "Satire",
            "Dark Comedy",
            "Slapstick",
            "Parody",
            "Absurdist Comedy",
            "Situational Comedy",
            "Comedy of Errors",
            "Social Comedy",
            "Adventure Comedy",
        ],
    };

    const povOptions = [
        "First Person",
        "Third Person Limited",
        "Third Person Omniscient",
    ];
    const lengthOptions = [
        "Single Sentence",
        "Full Page (approximately 500–700 words)",
    ];
    const tonesList = [
        "Dark",
        "Hopeful",
        "Gritty",
        "Poetic",
        "Melancholic",
        "Whimsical",
        "Suspenseful",
        "Romantic",
        "Cynical",
        "Epic",
    ];
    const themeOptions = [
        "Love",
        "Betrayal",
        "Survival",
        "Identity",
        "Power",
        "Freedom",
        "Loss",
        "Redemption",
        "Obsession",
        "Coming of Age",
    ];
    const timePeriodsList = [
        "Ancient Past",
        "Medieval Era",
        "18th–19th Century",
        "Modern Day",
        "Near Future",
        "Distant Future",
        "Timeless / Undefined",
    ];

    const toggleMenu = (menu) => {
        setMenus((prev) => {
            const newState = {
                genre: false,
                subGenre: false,
                pov: false,
                length: false,
                tone: false,
                timePeriod: false,
                theme: false,
            };
            newState[menu] = !prev[menu];
            return newState;
        });
    };

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".custom-dropdown-container")) {
                setMenus({
                    genre: false,
                    subGenre: false,
                    pov: false,
                    length: false,
                    tone: false,
                    timePeriod: false,
                    theme: false,
                });
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [formData, setFormData] = useState({
        genre: "",
        selectedSubGenres: { Fantasy: "", "Science Fiction": "", Romance: "" },
        pov: "",
        length: "",
        tone: "",
        themes: [],
        timePeriod: "",
    });

    const handleSingleSelect = (field, value) => {
        setFormData({ ...formData, [field]: value });
        setMenus((prev) => ({ ...prev, [field]: false }));
    };

    const handleSubGenreSelect = (mainGen, sub) => {
        const isCurrent = formData.selectedSubGenres[mainGen] === sub;

        setFormData((prev) => {
            const newSubGenres = {
                Fantasy: "",
                "Science Fiction": "",
                Romance: "",
            };
            newSubGenres[mainGen] = isCurrent ? "" : sub;
            return {
                ...prev,
                selectedSubGenres: newSubGenres,
            };
        });
    };

    const handleToggleMulti = (field, value) => {
        const current = formData[field];
        const updated = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];

        setFormData({ ...formData, [field]: updated });
    };

    const getSelectedSubGenresDisplay = () => {
        const selected = Object.values(formData.selectedSubGenres).filter(
            (v) => v !== "",
        );
        return selected.length > 0 ? selected.join(", ") : "SELECT SUB-GENRES";
    };

    const handleGenerate = () => {
        const selectedSubs = Object.entries(formData.selectedSubGenres).filter(
            ([_, sub]) => sub !== "",
        );

        if (!formData.genre) {
            alert("Please select a Genre!");
            return;
        }
        if (selectedSubs.length === 0) {
            alert("Please select at least one Sub-Genre!");
            return;
        }
        if (!formData.pov) {
            alert("Please select Point of View (POV)!");
            return;
        }
        if (!formData.length) {
            alert("Please select Expected Length!");
            return;
        }

        setLoading(true);
        const subGenresStr = selectedSubs.map(([_, sub]) => sub).join(", ");
        const themesListStr =
            formData.themes.length > 0
                ? formData.themes.join(", ")
                : "Not Selected";

        const selectionSummary =
            `User Selections:\n\n` +
            `Genre: ${formData.genre}\n` +
            `Sub-Genre: ${subGenresStr}\n` +
            `POV: ${formData.pov}\n` +
            `Length: ${formData.length}\n` +
            `Tone: ${formData.tone || "Not Selected"}\n` +
            `Theme: ${themesListStr}\n` +
            `Time Period: ${formData.timePeriod || "Not Selected"}`;

        setTimeout(() => {
            setPrompt(selectionSummary);
            setLoading(false);
        }, 500);
    };

    const handleGeneratePrompt = async () => {
        if (!prompt) return;
        setGeneratePromptLoading(true);
        setGeneratePromptError("");
        setGeneratedPrompt("");
        try {
            const { data } = await axios.post(
                route("custom-prompt-generator.generate"),
                { selection_summary: prompt }
            );
            setGeneratedPrompt(data.prompt || "");
        } catch (err) {
            const message =
                err.response?.data?.error ||
                "Failed to generate prompt. Please try again.";
            setGeneratePromptError(message);
        } finally {
            setGeneratePromptLoading(false);
        }
    };

    return (
        <Layout headerClass="inner-header">
            <Head title="Custom Prompt Generator" />
            <main className="prompt-gen-wrapper">
                <section className="pt-200 pb-100">
                    <div className="container">
                        <h1 className="prompt-gen-title">
                            Custom Prompt Generator
                        </h1>
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="generator-main-card">
                                    <div className="row g-5">
                                        {/* 1. GENRE */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                1. GENRE *
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("genre")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.genre ||
                                                            "SELECT GENRE"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.genre
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.genre && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {mainGenresList.map(
                                                            (g) => (
                                                                <div
                                                                    key={g}
                                                                    className={`menu-item-check ${formData.genre === g ? "active" : ""}`}
                                                                    onClick={() =>
                                                                        handleSingleSelect(
                                                                            "genre",
                                                                            g,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="option-text">
                                                                        {g}
                                                                    </span>
                                                                    <input
                                                                        type="radio"
                                                                        checked={
                                                                            formData.genre ===
                                                                            g
                                                                        }
                                                                        readOnly
                                                                        className="custom-radio-input"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 2. SUB-GENRE */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                2. SUB-GENRE *
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("subGenre")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {getSelectedSubGenresDisplay()}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.subGenre
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.subGenre && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {!formData.genre ? (
                                                            <div className="px-3 py-3 text-muted small">
                                                                Please select a Genre first.
                                                            </div>
                                                        ) : categories[formData.genre]?.length > 0 ? (
                                                            categories[
                                                                formData.genre
                                                            ].map((sub) => (
                                                                <div
                                                                    key={sub}
                                                                    className={`menu-item-check ${formData.selectedSubGenres[formData.genre] === sub ? "active" : ""}`}
                                                                    onClick={() =>
                                                                        handleSubGenreSelect(
                                                                            formData.genre,
                                                                            sub,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="option-text">
                                                                        {sub}
                                                                    </span>
                                                                    <input
                                                                        type="radio"
                                                                        name={`sub-${formData.genre}`}
                                                                        checked={
                                                                            formData
                                                                                .selectedSubGenres[
                                                                                formData.genre
                                                                            ] === sub
                                                                        }
                                                                        readOnly
                                                                        className="custom-radio-input"
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-3 py-3 text-muted small">
                                                                No sub-genres for this genre.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="dropdown-info-text">
                                                You can select one option from
                                                one category.
                                            </p>
                                        </div>

                                        {/* 3. POV */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                3. POINT OF VIEW (POV) *
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("pov")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.pov ||
                                                            "SELECT POV"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform: menus.pov
                                                                ? "rotate(90deg)"
                                                                : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.pov && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {povOptions.map((o) => (
                                                            <div
                                                                key={o}
                                                                className={`menu-item-check ${formData.pov === o ? "active" : ""}`}
                                                                onClick={() =>
                                                                    handleSingleSelect(
                                                                        "pov",
                                                                        o,
                                                                    )
                                                                }
                                                            >
                                                                <span className="option-text">
                                                                    {o}
                                                                </span>
                                                                <input
                                                                    type="radio"
                                                                    checked={
                                                                        formData.pov ===
                                                                        o
                                                                    }
                                                                    readOnly
                                                                    className="custom-radio-input"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 4. LENGTH */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                4. LENGTH *
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("length")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.length ||
                                                            "SELECT LENGTH"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.length
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.length && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {lengthOptions.map(
                                                            (o) => (
                                                                <div
                                                                    key={o}
                                                                    className={`menu-item-check ${formData.length === o ? "active" : ""}`}
                                                                    onClick={() =>
                                                                        handleSingleSelect(
                                                                            "length",
                                                                            o,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="option-text">
                                                                        {o}
                                                                    </span>
                                                                    <input
                                                                        type="radio"
                                                                        checked={
                                                                            formData.length ===
                                                                            o
                                                                        }
                                                                        readOnly
                                                                        className="custom-radio-input"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 5. TONE */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                5. TONE (OPTIONAL)
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("tone")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.tone ||
                                                            "SELECT TONE"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.tone
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.tone && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {tonesList.map((t) => (
                                                            <div
                                                                key={t}
                                                                className={`menu-item-check ${formData.tone === t ? "active" : ""}`}
                                                                onClick={() =>
                                                                    handleSingleSelect(
                                                                        "tone",
                                                                        t,
                                                                    )
                                                                }
                                                            >
                                                                <span className="option-text">
                                                                    {t}
                                                                </span>
                                                                <input
                                                                    type="radio"
                                                                    checked={
                                                                        formData.tone ===
                                                                        t
                                                                    }
                                                                    readOnly
                                                                    className="custom-radio-input"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 6. TIME PERIOD */}
                                        <div className="col-md-6 text-center">
                                            <label className="gen-label">
                                                6. TIME PERIOD (OPTIONAL)
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("timePeriod")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.timePeriod ||
                                                            "SELECT TIME PERIOD"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.timePeriod
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.timePeriod && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {timePeriodsList.map(
                                                            (tp) => (
                                                                <div
                                                                    key={tp}
                                                                    className={`menu-item-check ${formData.timePeriod === tp ? "active" : ""}`}
                                                                    onClick={() =>
                                                                        handleSingleSelect(
                                                                            "timePeriod",
                                                                            tp,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="option-text">
                                                                        {tp}
                                                                    </span>
                                                                    <input
                                                                        type="radio"
                                                                        checked={
                                                                            formData.timePeriod ===
                                                                            tp
                                                                        }
                                                                        readOnly
                                                                        className="custom-radio-input"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 7. THEMES */}
                                        <div className="col-12 text-center">
                                            <label className="gen-label">
                                                7. THEMES (MULTI-SELECT)
                                            </label>
                                            <div className="custom-dropdown-container">
                                                <div
                                                    className="gen-select dropdown-trigger"
                                                    onClick={() =>
                                                        toggleMenu("theme")
                                                    }
                                                >
                                                    <span className="text-truncate">
                                                        {formData.themes
                                                            .length > 0
                                                            ? formData.themes.join(
                                                                  ", ",
                                                              )
                                                            : "SELECT THEMES"}
                                                    </span>
                                                    <Icons.ArrowRight
                                                        style={{
                                                            transform:
                                                                menus.theme
                                                                    ? "rotate(90deg)"
                                                                    : "rotate(0deg)",
                                                            transition: "0.3s",
                                                        }}
                                                    />
                                                </div>
                                                {menus.theme && (
                                                    <div className="custom-menu-list shadow-lg">
                                                        {themeOptions.map(
                                                            (theme) => (
                                                                <div
                                                                    key={theme}
                                                                    className={`menu-item-check ${formData.themes.includes(theme) ? "active" : ""}`}
                                                                    onClick={() =>
                                                                        handleToggleMulti(
                                                                            "themes",
                                                                            theme,
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="option-text">
                                                                        {theme}
                                                                    </span>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={formData.themes.includes(
                                                                            theme,
                                                                        )}
                                                                        readOnly
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4 px-4">
                                            <button
                                                className="generate-btn mb-20"
                                                onClick={handleGenerate}
                                                disabled={loading}
                                            >
                                                {loading
                                                    ? "GENERATING..."
                                                    : "GENERATE SELECTION SUMMARY"}
                                            </button>
                                        </div>
                                    </div>

                                    {prompt && (
                                        <div className="result-area mt-5 mb-20 animate__animated animate__fadeIn">
                                            <div className="mb-3">
                                                <span className="result-tag">
                                                    USER SELECTION SUMMARY
                                                </span>
                                            </div>
                                            <p
                                                className="final-prompt"
                                                style={{
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {prompt}
                                            </p>
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    className="generate-btn generate-prompt-btn mb-20"
                                                    onClick={handleGeneratePrompt}
                                                    disabled={generatePromptLoading}
                                                >
                                                    {generatePromptLoading
                                                        ? "GENERATING PROMPT..."
                                                        : "GENERATE PROMPT"}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {generatePromptError && (
                                        <div className="generated-prompt-card mt-4 generated-prompt-error">
                                            {generatePromptError}
                                        </div>
                                    )}

                                    {generatedPrompt && (
                                        <div className="generated-prompt-card mt-4 animate__animated animate__fadeIn">
                                            <div className="mb-3">
                                                <span className="result-tag">
                                                    GENERATED PROMPT
                                                </span>
                                            </div>
                                            <p
                                                className="final-prompt"
                                                style={{
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
                                                {generatedPrompt}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </Layout>
    );
};

export default CustomPromptGenerator;
