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

const ObjectSelectionPanel = ({ onAddObject }) => {
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
      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Objects"}
      </button>

      <div className={`object-selection-panel ${isOpen ? "open" : ""}`}>
        {isOpen && (
          <div className="object-grid">
            {objectOptions.map((object) => (
              <div key={object.id} className="object-item">
                <img src={object.image} alt={object.name} className="object-preview-image" />
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
