"use client";

import PreviewML from "@/app/_components/ml/preview";
import { BadgeX, Share2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MLExecResult() {
    const [data, setData] = useState(null);
    const [inputParams, setInputParams] = useState(null);
    const [codeContent, setCodeContent] = useState("");
    const [logsContent, setLogsContent] = useState("");
    const [bestContent, setBestContent] = useState("");
    const [executionStatus, setExecutionStatus] = useState("running");

    const [showCode, setShowCode] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const [showSharePopup, setShowSharePopup] = useState(false);
    const [shareEmails, setShareEmails] = useState("");

    const { id } = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchData = () => {
            fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:5002"}/api/runs/run`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ runID: id }),
                },
            )
                .then((response) => response.json())
                .then((responseData) => {
                    setData(responseData.data);
                    setExecutionStatus(responseData.data.status);

                    if (responseData.data.status === "completed") {
                        fetchLogsContent();
                        fetchBestContent();
                    } else if (responseData.data.status === "error") {
                        console.error("Execution failed on backend");
                    } else {
                        setTimeout(fetchData, 4000);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                    setExecutionStatus("error");
                });
        };

        const fetchInputParams = () => {
            fetch(
                `${process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? "http://localhost:9000"}/code/${id}/input.json`,
            )
                .then((response) => response.json())
                .then((data) => setInputParams(data))
                .catch((error) =>
                    console.error("Error fetching input params:", error),
                );
        };

        const fetchCodeContent = () => {
            fetch(
                `${process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? "http://localhost:9000"}/code/${id}/code.py`,
            )
                .then((response) => response.text())
                .then((text) => setCodeContent(text))
                .catch((error) =>
                    console.error("Error fetching code content:", error),
                );
        };

        const fetchLogsContent = () => {
            fetch(
                `${process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? "http://localhost:9000"}/code/${id}/logbook.txt`,
            )
                .then((response) => response.text())
                .then((text) => setLogsContent(text))
                .catch((error) =>
                    console.error("Error fetching logs content:", error),
                );
        };

        const fetchBestContent = () => {
            fetch(
                `${process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? "http://localhost:9000"}/code/${id}/best.txt`,
            )
                .then((response) => response.text())
                .then((text) => setBestContent(text))
                .catch((error) =>
                    console.error("Error fetching best content:", error),
                );
        };

        fetchData();
        fetchInputParams();
        fetchCodeContent();
    }, [router, id]);

    const handleShareSubmit = (e) => {
        e.preventDefault();

        fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "http://localhost:5002"}/api/runs/share`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    runID: id,
                    userEmailList: shareEmails
                        .split(",")
                        .map((email) => email.trim()),
                }),
            },
        ).then(async (response) => {
            if (response.status === 200) {
                alert("Run shared successfully");
                return;
            }

            if (response.status === 401) {
                alert("Unauthorized");
                return;
            }

            if (response.status === 400) {
                const data = await response.json();
                alert(data.message);
            }

            return;
        });

        setShowSharePopup(false);
        setShareEmails("");
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-mono)] p-8 bg-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                    Evolve OnClick
                </h1>
                <p className="text-gray-600">
                    Run and Visualize algorithms with just a click.
                </p>
            </div>

            <h2 className="text-xl font-bold text-gray-800">
                Execution ID: {id}
            </h2>

            <div className="mt-4">
                <p className="text-gray-700">
                    Status:{" "}
                    {executionStatus === "completed"
                        ? "Completed"
                        : executionStatus === "running"
                          ? "Running..."
                          : "Error"}
                </p>
                {executionStatus === "running" && (
                    <div className="animate-pulse text-gray-500">
                        Fetching results, please wait...
                    </div>
                )}
                {executionStatus === "error" && (
                    <div className="text-red-500">
                        An error occurred during execution. Please check the
                        logs or try again.
                    </div>
                )}
            </div>

            <div className="flex flex-row items-center gap-4 mt-4">
                <Link
                    href="/create/ml"
                    className="rounded-full border border-solid border-black/[.08] transition-colors flex items-center justify-center bg-background text-foreground hover:bg-[#000000] hover:text-background text-sm sm:text-base px-4 py-2 mt-8"
                >
                    ← Go Back
                </Link>
                <button
                    className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-900 hover:bg-gray-200 text-sm sm:text-base px-4 py-2 mt-8"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowLogs(false);
                        setShowCode(!showCode);
                    }}
                >
                    {showCode ? "Hide Code </>" : "Show Code </ >"}
                </button>
                <button
                    className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-900 hover:bg-gray-200 text-sm sm:text-base px-4 py-2 mt-8"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowCode(false);
                        setShowLogs(!showLogs);
                    }}
                >
                    {showLogs ? "Hide Logs (x)" : "Show Logs (-)"}
                </button>
                <button
                    className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-900 hover:bg-gray-200 text-sm sm:text-base px-4 py-2 mt-8"
                    onClick={(e) => {
                        e.preventDefault();
                        setShowSharePopup(true);
                    }}
                >
                    <Share2 size={16} className="mr-2" />
                    Share Run
                </button>
                <Link
                    href="/bin"
                    className="rounded-full border border-solid border-black/[.08] transition-colors flex items-center justify-center bg-background text-foreground hover:bg-[#000000] hover:text-background text-sm sm:text-base px-4 py-2 mt-8"
                >
                    View All Runs →
                </Link>
            </div>

            <div className="flex flex-wrap mt-8 gap-4">
                {inputParams && codeContent ? (
                    <div className="flex flex-wrap gap-4 border border-gray-400 rounded-2xl bg-white bg-opacity-70">
                        <PreviewML
                            datasetURL={inputParams.googleDriveUrl}
                            targetColumnName={inputParams.targetColumnName}
                            sep={inputParams.sep}
                            mlImportCodeString={inputParams.mlImportCodeString}
                            mlEvalFunctionCodeString={
                                inputParams.mlEvalFunctionCodeString
                            }
                            chosenAlgo={inputParams.algorithm}
                            mu={inputParams.mu}
                            lambda={inputParams.lambda}
                            populationSize={inputParams.populationSize}
                            generations={inputParams.generations}
                            cxpb={inputParams.cxpb}
                            mutpb={inputParams.mutpb}
                            hof={inputParams.hof}
                            parameters={inputParams.weights}
                            matingFunc={inputParams.crossoverFunction}
                            mutateFunc={inputParams.mutationFunction}
                            selectFunc={inputParams.selectionFunction}
                            tempTourSize={inputParams.tournamentSize}
                            currentStep={13}
                        />
                        <div className="flex flex-col items-start border border-gray-400 rounded-2xl p-4 bg-white shadow-lg max-w-[75%]">
                            {showCode ? (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Code
                                    </h3>
                                    <Link
                                        href={`/explain/${id}`}
                                        className=" inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-slate-700 border border-slate-300  shadow-sm transition-all duration-200 ease-in-out hover:bg-slate-200 hover:border-slate-400 hover:text-slate-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:bg-slate-300 active:scale-[0.98] mt-8"
                                    >
                                        <Sparkles
                                            size={16}
                                            className="text-blue-500"
                                            aria-hidden="true"
                                        />{" "}
                                        Ask EvOC AI to Explain
                                    </Link>
                                    <pre className="bg-gray-200 p-4 rounded-lg overflow-auto text-sm mt-4 w-[900px]">
                                        <code className="overflow-auto text-wrap w-[900px]">
                                            {codeContent}
                                        </code>
                                    </pre>
                                </div>
                            ) : showLogs ? (
                                <div className="w-full flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Generation Wise Logs
                                    </h3>
                                    <button
                                        className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-white text-gray-900 hover:bg-gray-200 text-sm sm:text-base px-4 py-2 mt-2 w-fit"
                                        onClick={() => {
                                            const element =
                                                document.createElement("a");
                                            const file = new Blob(
                                                [logsContent],
                                                { type: "text/plain" },
                                            );
                                            element.href =
                                                URL.createObjectURL(file);
                                            element.download = `logs_${id}.txt`;
                                            document.body.appendChild(element);
                                            element.click();
                                        }}
                                    >
                                        Download Logs
                                    </button>
                                    <pre className="rounded-lg text-sm mt-4 w-[900px]">
                                        <code className="w-[900px]">
                                            {logsContent}
                                        </code>
                                    </pre>
                                </div>
                            ) : data && data.status === "completed" ? (
                                <>
                                    {bestContent && (
                                        <>
                                            <h3 className="text-xl font-bold text-gray-800 mt-4">
                                                Best Individual Fitness
                                            </h3>
                                            <pre className="rounded-lg text-sm mt-4 overflow-auto w-[200px]">
                                                <code className="overflow-auto text-wrap">
                                                    {bestContent}
                                                </code>
                                            </pre>
                                        </>
                                    )}
                                    {data && data.status === "completed" && (
                                        <div className="mt-4">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                Fitness Plot
                                            </h3>
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? "http://localhost:9000"}/code/${id}/fitness_plot.png`}
                                                alt="Fitness Plot"
                                                width={800}
                                                height={100}
                                                className="mt-2 rounded-lg shadow-sm border"
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg
                                        className="animate-spin h-5 w-5 text-gray-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Running...
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg
                            className="animate-spin h-5 w-5 text-gray-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Running...
                    </div>
                )}
            </div>

            {/* Share Run Popup */}
            {showSharePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-3xl p-6 w-[60%] relative">
                        <button
                            onClick={() => setShowSharePopup(false)}
                            className="absolute top-2 right-2 rounded-full p-2"
                        >
                            <BadgeX size={32} />
                        </button>
                        <h3 className="text-xl font-bold mb-4">Share Run</h3>
                        <form onSubmit={handleShareSubmit}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Enter email IDs (comma separated):
                            </label>
                            <input
                                type="text"
                                value={shareEmails}
                                onChange={(e) => setShareEmails(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="example1@mail.com, example2@mail.com"
                                required
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSharePopup(false)}
                                    className="rounded-full transition-colors flex items-center justify-center bg-white text-black hover:text-white hover:bg-black text-sm sm:text-base h-12 p-4 w-full  border border-black gap-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-full transition-colors flex items-center justify-center bg-yellow-400 text-black hover:bg-yellow-50 text-sm sm:text-base h-12 p-4 w-full   border border-black gap-2"
                                >
                                    Share
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
