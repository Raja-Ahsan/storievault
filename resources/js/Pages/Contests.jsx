import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router } from "@inertiajs/react";


const CreateContest = () => {
    const [selectedContestType, setSelectedContestType] = useState("");


 
    // Contest options
    const contestOptions = [
        "Monthly Fiction Contest",
        "Poetry Contest"
    ];





    const handleCreate = () => {
        if (!selectedContestType) return;

        if (selectedContestType === "Monthly Fiction Contest") {
            router.visit("/monthly-fiction-contest");
        } else if (selectedContestType === "Poetry Contest") {
            router.visit("/poetry-contest");
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
                    {/* Header */}
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
                                        textShadow:
                                            "0 2px 10px rgba(0,0,0,0.2)",
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
                                {/* Header */}
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
                                        Choose a contest to
                                        participate
                                    </p>
                                </div>

                                {/* Content */}
                                <div style={{ padding: "40px" }}>
                                    {/* Contest Type Selection */}
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
                                            {contestOptions.map(
                                                (contest) => (
                                                    <button
                                                        key={contest}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedContestType(
                                                                contest,
                                                            );
                                                        }}
                                                        style={{
                                                            padding: "20px",
                                                            borderRadius:
                                                                "12px",
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
                                                            transition:
                                                                "all 0.3s ease",
                                                            boxShadow:
                                                                selectedContestType ===
                                                                contest
                                                                    ? "0 5px 20px rgba(254, 162, 87, 0.2)"
                                                                    : "none",
                                                            position:
                                                                "relative",
                                                            overflow: "hidden",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (
                                                                selectedContestType !==
                                                                contest
                                                            ) {
                                                                e.target.style.borderColor =
                                                                    "#fea257";
                                                                e.target.style.background =
                                                                    "#fafafa";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (
                                                                selectedContestType !==
                                                                contest
                                                            ) {
                                                                e.target.style.borderColor =
                                                                    "#e0e0e0";
                                                                e.target.style.background =
                                                                    "#fff";
                                                            }
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
                                                                    display:
                                                                        "flex",
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
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </div>





                                    {/* ...existing code... */}

                                    {/* Action Buttons */}
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
                                                transition: "all 0.3s ease",
                                                cursor: "pointer",
                                                textDecoration: "none",
                                                display: "inline-block",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background =
                                                    "#6c757d";
                                                e.target.style.color = "#fff";
                                                e.target.style.transform =
                                                    "translateY(-2px)";
                                                e.target.style.boxShadow =
                                                    "0 5px 15px rgba(108, 117, 125, 0.3)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background =
                                                    "transparent";
                                                e.target.style.color =
                                                    "#6c757d";
                                                e.target.style.transform =
                                                    "translateY(0)";
                                                e.target.style.boxShadow =
                                                    "none";
                                            }}
                                        >
                                            Cancel
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleCreate}
                                            disabled={
                                                !selectedContestType
                                            }
                                            style={{
                                                padding: "12px 40px",
                                                borderRadius: "10px",
                                                background:
                                                    selectedContestType
                                                        ? "linear-gradient(135deg, #fea257 0%, #ff8c42 100%)"
                                                        : "#ccc",
                                                border: "none",
                                                color: "#fff",
                                                fontSize: "1.5rem",
                                                fontWeight: "600",
                                                transition: "all 0.3s ease",
                                                cursor:
                                                    selectedContestType
                                                        ? "pointer"
                                                        : "not-allowed",
                                                boxShadow:
                                                    selectedContestType
                                                        ? "0 5px 20px rgba(254, 162, 87, 0.4)"
                                                        : "none",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (
                                                    selectedContestType
                                                ) {
                                                    e.target.style.transform =
                                                        "translateY(-2px)";
                                                    e.target.style.boxShadow =
                                                        "0 8px 25px rgba(254, 162, 87, 0.5)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (
                                                    selectedContestType
                                                ) {
                                                    e.target.style.transform =
                                                        "translateY(0)";
                                                    e.target.style.boxShadow =
                                                        "0 5px 20px rgba(254, 162, 87, 0.4)";
                                                }
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

            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </Layout>
    );
};

export default CreateContest;
