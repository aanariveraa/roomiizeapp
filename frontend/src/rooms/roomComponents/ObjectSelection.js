//ObjectSelectionPanel.js
// ->>>Displays a list of objects available to add to the room
// Fetches object options (GLB models and preview images)
// from Firebase Storage (or static sources), 
// shows a preview image for each item, and 
// calls a callback (onAddObject) when an item is selected.



import React, { useState, useEffect } from "react";
import { 
    getObjectOptions 
} from "../../services/firebaseService"; 

const ObjectSelectionPanel = ({ onAddObject, sidebarCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [objectOptions, setObjectOptions] = useState([]);

  useEffect(() => {
    const fetchObjectOptions = async () => {
      const objects = await getObjectOptions();
      setObjectOptions(objects);
    };

    fetchObjectOptions();
  }, []);

  return (
    <>
      <button
        className="toggle-button"
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          position: "fixed",
          top: "90px",
          left: sidebarCollapsed ? "80px" : "250px", 
          transition: "left 0.3s ease",
          zIndex: 100,
        }}
      >
        {isOpen ? "Close" : "Objects"} 
      </button>

      <div
        className={`object-selection-panel ${isOpen ? "open" : ""} ${
          sidebarCollapsed ? "collapsed" : "expanded"
        }`}
      >
        {isOpen && (
          <div className="object-grid">
            {objectOptions.map((object) => (
              <div key={object.id} className="object-item">
                <img
                  src={object.image}
                  alt={object.name}
                  className="object-preview-image"
                />
                <button onClick={() => onAddObject(object)}>
                  Place {object.name.replace(/_/g, " ").replace(/\.glb$/i, "")}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ObjectSelectionPanel;