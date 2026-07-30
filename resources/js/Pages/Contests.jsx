import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router } from "@inertiajs/react";

const CreateContest = () => {
    const [selectedContestType, setSelectedContestType] = useState("");
    const [showComingSoon, setShowComingSoon] = useState(false);

    const contestOptions = [
        "Monthly Fiction Contest",
        "Poetry Contest",
    ];

    const handleSelectContest = (contest) => {
        if (contest === "Poetry Contest") {
            setShowComingSoon(true);
            return;
        }
        setSelectedContestType(contest);
    };

    const handleCreate = () => {
        if (!selectedContestType) return;

        if (selectedContestType === "Monthly Fiction Contest") {
            router.visit("/monthly-fiction-contest");
        } else if (selectedContestType === "Poetry Contest") {
            setShowComingSoon(true);
        }
    };

    return (
        <Layout headerClass="inner-header">
            <Head title="Create Contest" />
            <section
                style={{
                    background: "#F7EEE2",
                    minHeight: "100vh",
                    padding: "60px 0",
                    paddingTop: "200px",
                }}
            >
                <div className="container px-2 px-md-3 px-lg-4">
                    <div className="row mb-5">
                        <div className="col-12">
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: "30px",
                                }}
                            >
                                <h1
                                    style={{
                                        color: "#000",
                                        fontSize: "3.5rem",
                                        fontWeight: "800",
                                        textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                        letterSpacing: "-0.5px",
                                        lineHeight: "1.2",
                                        marginBottom: "15px",
                                    }}
                                >
                                    Contests
                                </h1>
                                <p
                                    style={{
                                        color: "#000",
                                        fontSize: "1.5rem",
                                        fontWeight: "600",
                                        marginTop: "10px",
                                        letterSpacing: "0.3px",
                                    }}
                                >
                                    Showcase your talent and win amazing prizes
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="row justify-content-center">
                        <div className="col-lg-11 col-xl-10">
                            <div
                                style={{
                                    borderRadius: "20px",
                                    border: "none",
                                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                                    overflow: "hidden",
                                    background: "#fff",
                                }}
                            >
                                <div
                                    style={{
                                        background:
                                            "linear-gradient(135deg, #fea257 0%, #ff8c42 100%)",
                                        padding: "25px 30px",
                                        color: "#fff",
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: "30px",
                                            fontWeight: "700",
                                        }}
                                    >
                                        Select Your Contest
                                    </h2>
                                    <p
                                        style={{
                                            margin: "8px 0 0 0",
                                            opacity: 0.95,
                                            fontSize: "1.7rem",
                                            fontWeight: "500",
                                        }}
                                    >
                                        Choose a contest to participate
                                    </p>
                                </div>

                                <div style={{ padding: "40px" }}>
                                    <div style={{ marginBottom: "40px" }}>
                                        <label
                                            style={{
                                                fontWeight: "700",
                                                color: "#333",
                                                fontSize: "2rem",
                                                marginBottom: "15px",
                                                display: "block",
                                            }}
                                        >
                                            Select Contest Type
                                        </label>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns:
                                                    "repeat(auto-fit, minmax(200px, 1fr))",
                                                gap: "15px",
                                            }}
                                        >
                                            {contestOptions.map((contest) => (
                                                <button
                                                    key={contest}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectContest(contest)
                                                    }
                                                    style={{
                                                        padding: "20px",
                                                        borderRadius: "12px",
                                                        border:
                                                            selectedContestType ===
                                                            contest
                                                                ? "3px solid #fea257"
                                                                : "2px solid #e0e0e0",
                                                        background:
                                                            selectedContestType ===
                                                            contest
                                                                ? "#fff5eb"
                                                                : "#fff",
                                                        color: "#333",
                                                        fontSize: "1.8rem",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        transition: "all 0.3s ease",
                                                        boxShadow:
                                                            selectedContestType ===
                                                            contest
                                                                ? "0 5px 20px rgba(254, 162, 87, 0.2)"
                                                                : "none",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {selectedContestType ===
                                                        contest && (
                                                        <div
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                top: "8px",
                                                                right: "8px",
                                                                width: "24px",
                                                                height: "24px",
                                                                background:
                                                                    "#fea257",
                                                                borderRadius:
                                                                    "50%",
                                                                color: "#fff",
                                                                fontSize:
                                                                    "1.8rem",
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                fontWeight:
                                                                    "bold",
                                                            }}
                                                        >
                                                            ✓
                                                        </div>
                                                    )}
                                                    {contest}
                                                    {contest ===
                                                        "Poetry Contest" && (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "1.1rem",
                                                                color: "#fea257",
                                                                marginTop: 8,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Coming Soon
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "15px",
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <Link
                                            href="/contests"
                                            style={{
                                                padding: "12px 30px",
                                                borderRadius: "10px",
                                                border: "2px solid #6c757d",
                                                background: "transparent",
                                                color: "#6c757d",
                                                fontSize: "1.2rem",
                                                fontWeight: "600",
                                                textDecoration: "none",
                                                display: "inline-block",
                                            }}
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleCreate}
                                            disabled={!selectedContestType}
                                            style={{
                                                padding: "12px 40px",
                                                borderRadius: "10px",
                                                background: selectedContestType
                                                    ? "linear-gradient(135deg, #fea257 0%, #ff8c42 100%)"
                                                    : "#ccc",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "1.5rem",
                                                fontWeight: "600",
                                                cursor: selectedContestType
                                                    ? "pointer"
                                                    : "not-allowed",
                                                boxShadow: selectedContestType
                                                    ? "0 5px 20px rgba(254, 162, 87, 0.4)"
                                                    : "none",
                                            }}
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {showComingSoon && (
                <div
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setShowComingSoon(false)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            maxWidth: 420,
                            width: "100%",
                            padding: "32px 28px",
                            textAlign: "center",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                        }}
                    >
                        <div
                            style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                background: "#fff5eb",
                                color: "#fea257",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 28,
                                fontWeight: 700,
                                margin: "0 auto 16px",
                            }}
                        >
                            ✦
                        </div>
                        <h3
                            style={{
                                fontSize: "2rem",
                                fontWeight: 700,
                                marginBottom: 10,
                            }}
                        >
                            Coming Soon
                        </h3>
                        <p
                            style={{
                                color: "#666",
                                fontSize: "1.2rem",
                                marginBottom: 24,
                                lineHeight: 1.5,
                            }}
                        >
                            The Poetry Contest is not open yet. Stay tuned — we
                            will launch it soon!
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowComingSoon(false)}
                            style={{
                                padding: "12px 32px",
                                borderRadius: 10,
                                border: "none",
                                background:
                                    "linear-gradient(135deg, #fea257 0%, #ff8c42 100%)",
                                color: "#fff",
                                fontSize: "1.2rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CreateContest;
