import LoginPage from './components/LoginPage/LoginPage'
import MainPage from './components/MainPage/MainPage';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>

  )
}

export default App
