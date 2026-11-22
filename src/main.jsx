import { createRoot } from 'react-dom/client'
import './index.css' // <-- Dòng này chính là dây điện gọi bộ sơn màu!
import { installShopCdnRuntime } from './utils/cdnAsset'
import App from './App.jsx'

installShopCdnRuntime();

createRoot(document.getElementById('root')).render(
  <App />
)