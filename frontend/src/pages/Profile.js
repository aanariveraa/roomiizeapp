import { useState, useEffect } from "react";
import { useUserAuth } from "../context/UserAuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateEmail, updatePassword, updateProfile } from "firebase/auth";
import { db, storage } from "../firebase/firebaseConfig";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";

const Profile = () => {
  const { user } = useUserAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
      setPhotoURL(user.photoURL || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"); // Default avatar
    }
  }, [user]);

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

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h2>Profile Settings</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleUpdate}>
          {/* Profile Picture */}
          <div className="text-center mb-3">
            <img src={photoURL} alt="Profile" className="rounded-circle" width="120" height="120" />
            <Form.Group className="mt-2">
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>
          </div>

          {/* Name */}
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          {/* New Password */}
          <Form.Group className="mb-3">
            <Form.Label>New Password (leave blank to keep current)</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Update Profile
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Profile;
