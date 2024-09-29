import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import ModelSelection from './pages/ModelSelection';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModelSelection />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    );
}

export default App
