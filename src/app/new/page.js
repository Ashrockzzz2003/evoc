"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "../_components/Loader";
import { ChooseAlgo } from "./_components/chooseAlgorithm";
import ChooseWeights from "./_components/chooseWeights";
import ChooseGenerator from "./_components/chooseGenerator";
import { GetIndividualSize } from "./_components/getIndividualSize";

export default function NewRunner() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Algorithm Parameters.
    const [chosenAlgo, setChosenAlgo] = useState(null);
    const [mu, setMu] = useState(0);
    const [lambda, setLambda] = useState(0);

    // Weights parameters.
    const [parameters, setParameters] = useState([]);

    // Individual Generator.
    const [indGen, setIndGen] = useState(null);
    const [randomRangeStart, setRandomRangeStart] = useState("");
    const [randomRangeEnd, setRandomRangeEnd] = useState("");

    const router = useRouter();

    useEffect(() => {
        if (chosenAlgo !== "eaMuPlusLambda" && chosenAlgo !== "eaMuCommaLambda") {
            if (parameters.length > 0 && currentStep < 3) {
                setCurrentStep(3);
            }
        }
    }, [currentStep])

    return isLoading ? <Loader type={"full"} message={"Running Algorithm..."} /> : (
        <main className="items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-mono)] p-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                    Evolve OnClick
                </h1>
                <p>Run and Visualize algorithms with just a click.</p>
            </div>

            <div className="border border-gray-400 rounded-2xl p-4 min-w-[40%] max-w-[70%]">
                <form className="flex flex-col">
                    <h3 className="text-xl font-bold">Configure Algorithm</h3>
                    <hr className="my-4" />

                    {currentStep >= 1 && (
                        <ChooseAlgo
                            chosenAlgo={chosenAlgo}
                            setChosenAlgo={setChosenAlgo}
                            currentStep={currentStep}
                            nextStep={2}
                            setCurrentStep={setCurrentStep}
                            mu={mu}
                            setMu={setMu}
                            lambda={lambda}
                            setLambda={setLambda}
                        />
                    )}

                    {currentStep >= 2 && (
                        <ChooseWeights
                            currentStep={currentStep}
                            nextStep={3}
                            setCurrentStep={setCurrentStep}
                            parameters={parameters}
                            setParameters={setParameters}
                        />
                    )}

                    {parameters.length > 0 && currentStep >= 3 && (
                        <ChooseGenerator
                            indGen={indGen}
                            setIndGen={setIndGen}
                            randomRangeStart={randomRangeStart}
                            setRandomRangeStart={setRandomRangeStart}
                            randomRangeEnd={randomRangeEnd}
                            setRandomRangeEnd={setRandomRangeEnd}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            nextStep={4}
                        />
                    )}

                    {currentStep >= 4 && indGen && randomRangeStart && randomRangeEnd && (parseInt(randomRangeStart) <= parseInt(randomRangeEnd)) && (
                        <GetIndividualSize />
                    )}
                </form>
            </div>
        </main>
    );
}