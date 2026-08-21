import { Outlet } from "react-router-dom";
import Masthead from "./Masthead";
import Footer from "./Footer";
import NotificationPrompt from "./NotificationPrompt";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Masthead />
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-10">
        <NotificationPrompt />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
