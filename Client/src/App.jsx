import React from "react";
import Sidebar from "./Components/Sidebar";
import { Route, Routes } from "react-router-dom";
import ChatBox from "./Components/ChatBox";
import Credits from "./Pages/Credits";
import Community from "./Pages/Community";

function App() {
  return (
    <>
      <div className="dark:bg-linear-to-b from-[#242124]to-[#000000] dark:text-white ">
        <div className="flex h-screen w-screen">
          <Sidebar />
          <Routes>
            <Route path="/" element={<ChatBox />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default App;
