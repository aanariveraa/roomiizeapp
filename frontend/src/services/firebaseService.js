import { storage } from "../firebase/firebaseConfig";
import { ref, getDownloadURL, listAll } from "firebase/storage";

//Helper Function for Fetching Model URLs
export async function getFileURL(folder, fileName) {
  try {
    const fileRef = ref(storage, `${folder}/${fileName}.glb`);
    const url = await getDownloadURL(fileRef);
    return url;

  } catch (error) {
    console.error("Error fetching file URL:", error);
    throw error;
  }
}

//Helper Function for Fetching Model OBJECT URLS
export const getObjectOptions = async () => {
    try {
        const itemsRef = ref(storage, "items"); // Reference to your "items" folder
        const res = await listAll(itemsRef);
        const items = await Promise.all(
          res.items.map(async (itemRef) => {
            const modelURL = await getDownloadURL(itemRef);
            // Assume the preview image is stored in the "previews" folder with the same name (without .glb extension)
            const baseName = itemRef.name.replace(/\.glb$/, "");
            const previewRef = ref(storage, `preview/${baseName}.png`);
            let previewURL;
            try {
              previewURL = await getDownloadURL(previewRef);
            } catch (error) {
              console.error("Error fetching preview for", baseName, error);
              previewURL = modelURL; // Fallback if preview not found
            }
            return {
              id: itemRef.fullPath, // Unique identifier
              name: itemRef.name,
              modelPath: modelURL,
              image: previewURL,
            };
      })
    );
    return items;
  } catch (error) {
    console.error("Error fetching object options:", error);
    return [];
  }
};

//preview room image
export async function getRoomPreviewURL(roomType) {
  try {
    // Map the room type to a specific file name.
    // Adjust these values according to your naming convention.
    const roomTypeMapping = {
      1: "suite1",
      2: "suite2",
      3: "suite3"
    };

    const fileName = roomTypeMapping[roomType];
    if (!fileName) {
      throw new Error("No preview image mapping found for room type " + roomType);
    }

    // Assume your preview images are stored in a folder called "roomsPreview"
    const fileRef = ref(storage, `preview/${fileName}.png`);
    const url = await getDownloadURL(fileRef);
    return url;
    
  } catch (error) {
    console.error("Error fetching room preview URL:", error);
    // Fallback URL or rethrow error as needed
    return "/defaultRoomImage.png";
  }

};