import { useState, useEffect } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { db, storage } from '../firebase/firebaseConfig';
import { Form, Button, Alert, Container, Card, InputGroup } from "react-bootstrap";
import { useNavigate} from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons"; // Import icons

const Profile = () => {
  const { user } = useUserAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password visibility
  const [profilePic, setProfilePic] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Check if the user signed in with Google
   const isGoogleUser = 
   user?.providerData?.some((provider) => provider.providerId === "google.com") ||
   user?.providerId === "google.com";

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      //setPhotoURL(user.photoURL || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"); // Default avatar
      
      // Get photoURL from user.photoURL 
      // or fall back to the providerData array
      let userPhoto = user.photoURL;
      if (!userPhoto && user.providerData && user.providerData.length > 0) {
        userPhoto = user.providerData[0].photoURL;
      }
      
      setPhotoURL(
        userPhoto ||
          "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"
      );
    }

    //if a user if GoogleUser 
    if (user && isGoogleUser) {
      console.log("User is signed in with Google");
    }

  }, [user, isGoogleUser]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  // Handle Profile Updates
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to update your profile.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      let updatedPhotoURL = photoURL;

      // Upload new profile picture if selected
      if (profilePic) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePic);
        updatedPhotoURL = await getDownloadURL(storageRef);
        setPhotoURL(updatedPhotoURL); // Update local state immediately
      }

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name, photoURL: updatedPhotoURL });

      // Update Firestore user document
      await updateDoc(userDocRef, {
        displayName: name,
        email: email,
        photoURL: updatedPhotoURL,
      });

      // Update Email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update Password if a new one is provided
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      setSuccess("✅ Profile updated successfully!");
    } catch (err) {
      setError(`❌ Error updating profile: ${err.message}`);
    }
  };

  const goBack = () => {
    //goes back one page 
    navigate(-1);
  }

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h2>Profile Settings</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* if google account- cant't have access to update info*/}
        {isGoogleUser && (
        <Alert variant="info">
          Note: Since you signed in with Google, your email and display name are managed by your Google account and cannot be edited here.
        </Alert>
      )}

        <button className="back-button" onClick={goBack}>
          Back
        </button>

        <Form onSubmit={handleUpdate}>

          {/* Profile Picture */}
          <div className="text-center mb-3">
            <img 
              src={photoURL} 
              alt="Profile" 
              className="rounded-circle" 
              width="120" 
              height="120" 
              />

              {/* Only show the file input if NOT a Google user */}
              {!isGoogleUser && (
                <Form.Group className="mt-2">
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isGoogleUser} // Disable for Google users
                />
                </Form.Group>
              )}
          </div>

          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={isGoogleUser} // Disable for Google users
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  disabled={isGoogleUser} // Disable for Google users
            />
          </Form.Group>

          {/* New Password */}
          {/* NEW Password Field with Eye Icon */}
          {!isGoogleUser && (
              <Form.Group className="mb-3">
              <Form.Label>
                New Password (leave blank to keep current)
              </Form.Label>
                    <InputGroup>
                        <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={isGoogleUser} // Disable for Google users
                            />
                          <InputGroup.Text onClick={togglePasswordVisibility} 
                              style={{ cursor: "pointer" }}>
                              {showPassword ? <EyeSlash /> : <Eye />}
                          </InputGroup.Text>
                      </InputGroup>
              </Form.Group>
          )}
          {/*
          <Button variant="primary" type="submit">
            Update Profile
          </Button>
          */}

          {!isGoogleUser && (
            <Button variant="primary" type="submit">
              Update Profile
            </Button>
          )}

        </Form>
      </Card>
    </Container>
  );
};

export default Profile;
