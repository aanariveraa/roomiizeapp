// ControlPanel.js for room3d 
// ->>Provides UI controls for manipulating the 3D view 
// (e.g., zoom, toggle between 3D/2D, change control mode, save state).
// Houses buttons for scene control and triggers save operations.

import React from "react";
import SuitetModel from "./SuiteModel";
import ObjectModel from "./ObjectModel";
import ObjectSelectionPanel from "./ObjectSelection";

const ControlPanel = ({ 
    onZoomIn, 
    onZoomOut, 
    displayMode, 
    setDisplayMode, 
    controlMode, 
    toggleControlMode, 
    toggleColorPicker,
    //onSave 
    selectedObject,           
    rotateObject,              
    onRemoveObject 
}) => (
    <div className="control-panel">
        <button onClick={onZoomIn} className="zoom-button">
            <img src="/icons/zoom_in.svg" alt="Zoom In" />
        </button>
        <button onClick={onZoomOut} className="zoom-button">
            <img src="/icons/zoom_out.svg" alt="Zoom Out" />
        </button>
        <div className="display-toggle-tabs">
            <button 
                className={`display-tab ${displayMode === "3D" ? "active" : ""}`}
                onClick={() => setDisplayMode("3D")}> 3D
            </button>
        <button 
            className={`display-tab ${displayMode === "2D" ? "active" : ""}`} 
            onClick={() => setDisplayMode("2D")}> 2D
        </button>
        
        </div> 
            <button onClick={toggleControlMode} 
                className={`control-button ${controlMode === "person" ? "active" : ""}`}>
                <img src="/icons/person_view.svg" alt="Person View" className="person-view-icon" />
                Person View
            </button>
        {/* New Color Picker Toggle Button */}
            <button onClick={toggleColorPicker} className="control-button">
                <img src="/icons/color_palette.svg" alt="Toggle Color Picker" />
            </button>
            {selectedObject && (
                <div className="selected-object-controls">
                    <button onClick={() => rotateObject(selectedObject, -15)} className="control-button">
                    <img src="/icons/rotate_left.svg" alt="Rotate Left" />
                    </button>
                    <button onClick={() => rotateObject(selectedObject, 15)} className="control-button">
                    <img src="/icons/rotate_right.svg" alt="Rotate Right" />
                    </button>
                    <button onClick={onRemoveObject} className="control-button">
                    <img src="/icons/remove.svg" alt="Delete" />
                    </button>
                </div>
            )}
    </div>
);

export default ControlPanel;