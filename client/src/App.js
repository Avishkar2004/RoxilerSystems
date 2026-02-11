import React from "react";
import AppRoutes from "./routes/Routes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Container from "./components/ui/Container";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <Container>
        <AppRoutes />
      </Container>
      <Footer />
    </div>
  );
}

export default App;