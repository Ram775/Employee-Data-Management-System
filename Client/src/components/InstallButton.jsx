import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("App Installed ✅");

      // 🎉 Confetti Start
      setShowConfetti(true);

      // Stop after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      {showConfetti && <Confetti numberOfPieces={400} recycle={false} />}

      <motion.button
        onClick={handleInstall}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-full shadow-xl z-50"
      >
        Install App
      </motion.button>
    </>
  );
}
