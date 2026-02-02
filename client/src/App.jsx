import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AuctionDetails from './pages/AuctionDetails';

import GuestOnly from './routes/GuestOnly';
import AuthOnly from './routes/AuthOnly';
import AuthBootstrap from './components/AuthBootstrap';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <AuthBootstrap>
        <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
          <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auctions/:id' element={<AuctionDetails />} />

            <Route element={<GuestOnly />}>
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
            </Route>

            <Route element={<AuthOnly />}>
              <Route path='/profile' element={<Profile />} />
            </Route>
          </Routes>
        </div>
      </AuthBootstrap>
    </Router>
  );
}

export default App;
