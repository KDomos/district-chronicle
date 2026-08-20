import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SiteProvider } from "./context/SiteContext";

import PublicLayout from "./components/PublicLayout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Gossip from "./pages/Gossip";
import PostDetail from "./pages/PostDetail";
import Gallery from "./pages/Gallery";
import AlbumDetail from "./pages/AlbumDetail";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import TagPage from "./pages/TagPage";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import PostsManager from "./pages/admin/PostsManager";
import PostEditor from "./pages/admin/PostEditor";
import CommentsModeration from "./pages/admin/CommentsModeration";
import AlbumsManager from "./pages/admin/AlbumsManager";
import PortfolioEditor from "./pages/admin/PortfolioEditor";
import SettingsEditor from "./pages/admin/SettingsEditor";
import Inbox from "./pages/admin/Inbox";

function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-4xl font-bold mb-2">404</p>
      <p className="text-ink-soft">This page was never filed.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/gossip" element={<Gossip />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/gossip/:slug" element={<PostDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/gallery/:albumId" element={<AlbumDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/tag/:tag" element={<TagPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="posts/:postType" element={<PostsManager />} />
                <Route path="posts/:postType/:postId" element={<PostEditor />} />
                <Route path="comments" element={<CommentsModeration />} />
                <Route path="albums" element={<AlbumsManager />} />
                <Route path="portfolio" element={<PortfolioEditor />} />
                <Route path="inbox" element={<Inbox />} />
                <Route path="settings" element={<SettingsEditor />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SiteProvider>
    </AuthProvider>
  );
}
