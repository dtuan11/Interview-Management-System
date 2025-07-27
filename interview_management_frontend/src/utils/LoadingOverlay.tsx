// src/utils/LoadingOverlay.tsx
import React from 'react';
interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    return isLoading ? (
        <div className="loading-overlay">
            <div className="sharingon">
                <div className="ring">
                    <div className="to"></div>
                    <div className="to"></div>
                    <div className="to"></div>
                    <div className="circle"></div>
                </div>
            </div>
        </div>
    ) : null;
};

export default LoadingOverlay;
