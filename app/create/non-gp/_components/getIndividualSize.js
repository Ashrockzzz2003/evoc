export function GetIndividualSize({
    indSize,
    setIndSize,
    currentStep,
    nextStep,
    setCurrentStep,
}) {
    return (
        <div className="mt-16">
            <h4 className="text-lg font-bold mb-4">
                Step 4: Number of dimensions for the problem? (Individual Size)
            </h4>
            <input
                type="number"
                value={indSize}
                className="border border-gray-300 p-2 rounded-lg"
                placeholder="Enter a number"
                onChange={(e) => {
                    if (isNaN(e.target.value)) {
                        e.target.value = 0;
                    }
                    if (e.target.value < 0) {
                        e.target.value = 0;
                    }
                    setIndSize(e.target.value);
                    if (e.target.value > 0) {
                        setCurrentStep(
                            currentStep < nextStep ? nextStep : currentStep,
                        );
                    }
                }}
            />
        </div>
    );
}
