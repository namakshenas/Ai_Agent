import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import ModelSelection from './pages/ModelSelection';
import usePingAPI from './hooks/usePingAPI';

function App() {

  const isAPIOffline = usePingAPI()

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModelSelection />} />
          <Route path="/chat" element={<Chat isAPIOffline={isAPIOffline}/>} />
          <Route path="*" element={<ModelSelection />} />
        </Routes>
      </BrowserRouter>
    );
}

export default App
