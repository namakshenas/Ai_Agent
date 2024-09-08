import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Chat from './pages/Chat';
import Nav from './components/Nav';

function App() {

  return (
      <BrowserRouter>
        <Nav/>
        <main>
          <Routes>
            <Route path="/" element={<Chat />} />
          </Routes>
        </main>
      </BrowserRouter>
    );
}

export default App
