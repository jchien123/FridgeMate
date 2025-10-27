import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  RouterProvider ,
  redirect
} from 'react-router-dom'


// layouts and pages
import RootLayout from './layouts/RootLayout'
import Dashboard, { itemsLoader } from './pages/Dashboard'
import Create, { createAction } from './pages/Create'
import ReceiptPage from './pages/Receipt'
import Profile from './pages/Profile'

const dashboardRedirect = () => {
  return redirect('/dashboard')
}

// router and routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Dashboard />} loader={dashboardRedirect} />
      <Route path="dashboard" index element={<Dashboard />} loader = {itemsLoader}/>
      <Route path="create" element={<Create />} action = {createAction} />
      <Route path="profile" element={<Profile />} />
      <Route path="receipt" element={<ReceiptPage />} />
    </Route>
  )
)

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
