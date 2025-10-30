import Layout from "./Layout.jsx";
import SpaceScene from "./SpaceScene";
import Home from "./Home";
// Add import for the preview image
import previewImage from "../resources/preview-image.jpeg";

// Add a small component that returns the image
function PreviewImage() {
  return (
    <img
      src={previewImage}
      alt="preview"
      style={{ width: "100%", height: "auto" }}
    />
  );
}

const PAGES = {
  SpaceScene: SpaceScene,
  Home: Home,
  // include new page in the pages map
  PreviewImage: PreviewImage,
};

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<SpaceScene />} />
        <Route path="/SpaceScene" element={<SpaceScene />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/preview-image.jpeg" element={<PreviewImage />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
