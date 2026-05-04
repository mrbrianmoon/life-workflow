import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './shared/Layout';
import Home from './pages/Home';
import TodoApp from './apps/todo/TodoApp';
import LawnCareApp from './apps/lawn-care/LawnCareApp';
import CarApp from './apps/car-maintenance/CarApp';
import Visitors from './pages/visitors/Visitors';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="todo" element={<TodoApp />} />
          <Route path="lawn-care" element={<LawnCareApp />} />
          <Route path="/car-maintenance" element={<CarApp />} />
          <Route path="visitors" element={<Visitors />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
