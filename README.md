# ROOMIIZE 

ROOMIIZE is a web-based React Native application that allows university students to design and organize their dorm rooms in 3D. The app features interactive drag-and-drop functionality, real-time collaboration via Firebase, API-powered furniture recommendations, and advanced 3D rendering with Three.js and Babylon.js.

### Features

3D Room Design: Create and customize dorm rooms using React Three Fiber and @react-three/drei.

Drag-and-Drop Functionality: Easily move furniture and objects within the room.

Firebase Authentication: Secure user registration and login.

Real-Time Collaboration: Work on room designs with friends via Firebase.

Furniture Recommendations: AI-powered recommendations using Google Vision API and Azure Cognitive Services.

Advanced Rendering: High-quality 3D rendering with Three.js and Babylon.js.

### Tech Stack

Frontend: React Native

3D Rendering: React Three Fiber, @react-three/drei, Three.js, Babylon.js

Backend: Firebase (Firestore for data storage, Authentication for user management)


### Installation

Clone the repository: git clone

Install dependencies: npm install

Start the app: npm start



### Project Structure

myroomiizeapp/
│── 3D Rooms/            # Separate directory for 3D components
│   ├── src/
│── src/
│   ├── components/      # UI components (Login, Signup, etc.)
│   ├── context/         # Context API for user authentication
│   ├── App.js           # Main entry point
│── firebase/            # Firebase configuration
│── assets/              # Static assets
│── package.json         # Dependencies and scripts
│── README.md            # Project documentation

### Future Enhancements

AR Support: Implement augmented reality for furniture placement.

Multi-Platform Support: Expand support for iOS and Android.

More AI Features: Enhance AI-driven recommendations and automation.

### Contributors

Team Members - Contributors

License

This project is licensed under the MIT License.

