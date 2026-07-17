import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "80vh",
      textAlign: "center",
      fontFamily: "Arial, sans-serif"
    },
    button: {
      marginTop: "20px",
      padding: "10px 20px",
      fontSize: "16px",
      cursor: "pointer",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "5px"
    }
  };

  return (
    <div style={styles.container}>
      <h1>403 - Unauthorized</h1>
      <p>Oops! You do not have permission to access this page.</p>
      <button style={styles.button} onClick={() => navigate(-1)}>
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;