import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "../pages/Chat";
import FirstStart from "../pages/FirstStart";

function CustomRouter() {

    return (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FirstStart />} />
            <Route path="/chat" element={<Chat/>} />
            <Route path="*" element={<FirstStart />} />
          </Routes>
        </BrowserRouter>
      );
  }
  
  export default CustomRouter