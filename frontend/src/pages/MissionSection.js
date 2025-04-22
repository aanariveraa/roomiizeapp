import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

const MissionSection = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/icons/roomAnimation.json`)
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);

  if (!animationData) return null;

  return (
    <section style={{ textAlign: "center", padding: "4rem 0" }}>
      <h2>Our Mission</h2>
      <p>Design your dream dorm space in real-time, effortlessly.</p>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <Lottie animationData={animationData} loop={true} />
      </div>
    </section>
  );
};

export default MissionSection;
