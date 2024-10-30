import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import FirstStart from './pages/FirstStart';

function App() {

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

export default App
