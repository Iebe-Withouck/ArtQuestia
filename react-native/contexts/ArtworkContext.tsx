import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ArtworkLocation {
    id: string;
    name: string;
    creator: string;
    latitude: number;
    longitude: number;
    description?: string;
    color?: string;
    theme?: string;
    modelPath?: string;
    sceneType?: 'bomb' | 'default' | string; // Add more scene types as needed
    arSceneNumber?: 1 | 2 | 3 | 4; // Which AR scene to show (1-4)
}

interface ArtworkContextType {
    selectedArtwork: ArtworkLocation | null;
    setSelectedArtwork: (artwork: ArtworkLocation | null) => void;
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export function ArtworkProvider({ children }: { children: ReactNode }) {
    const [selectedArtwork, setSelectedArtwork] = useState<ArtworkLocation | null>(null);

    return (
        <ArtworkContext.Provider value={{ selectedArtwork, setSelectedArtwork }}>
            {children}
        </ArtworkContext.Provider>
    );
}

export function useArtwork() {
    const context = useContext(ArtworkContext);
    if (context === undefined) {
        throw new Error('useArtwork must be used within an ArtworkProvider');
    }
    return context;
}
