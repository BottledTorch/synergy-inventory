import React, { useRef, useState } from 'react';
// import './PurchaseOrderInput.css'; // Assuming you have a separate CSS file for this component

const PurchaseOrderInput = ({ poInput, setPoInput, poRecommendations, setSelectedPO }) => {
    const [isFocused, setIsFocused] = useState(false);
    const blurTimeoutRef = useRef(null);

    // Filter the recommendations based on the user's input
    const filteredRecommendations = poRecommendations.filter(po => 
        po.id.toString().includes(poInput)
    );

    return (
        <div className="inputWrapper">
            <input 
                placeholder="Enter PO Number" 
                value={poInput} 
                onChange={e => setPoInput(e.target.value)} 
                onFocus={() => {
                    setIsFocused(true);
                    if (blurTimeoutRef.current) {
                        clearTimeout(blurTimeoutRef.current); // Clear the timeout if input is refocused quickly
                    }
                }}
                onBlur={() => {
                    // Use a timeout to delay the hiding of the recommendations
                    blurTimeoutRef.current = setTimeout(() => {
                        setIsFocused(false);
                    }, 150); // 150ms delay
                }}
            />
            {poInput && isFocused && (
                <div className="poRecommendations">
                    {filteredRecommendations.slice(0, 6).map(po => (
                        <div 
                            key={po.id} 
                            onClick={() => {
                                setSelectedPO(po.id);
                                setPoInput(po.id.toString());
                                setIsFocused(false); // Hide recommendations after selection
                                if (blurTimeoutRef.current) {
                                    clearTimeout(blurTimeoutRef.current); // Clear the timeout if a recommendation is clicked
                                }
                            }}
                        >
                            PO ID: {po.id}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderInput;
