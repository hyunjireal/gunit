import { ReactLenis } from 'lenis/react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'

function App() {
 console.log(import.meta.env.VITE_CHAT_API_URL)

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.9,
      }}
    >
      <RouterProvider router={router} />
    </ReactLenis>
  )
}

export default App
