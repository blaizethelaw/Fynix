import { Link, Route, Routes, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Protected from "@/components/Protected";
import Docs from "@/pages/Docs";
import Tools from "@/pages/Tools";
import Onboarding from "@/pages/Onboarding";
import Phoenix from "@/pages/Phoenix";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Billing from "@/pages/Billing";

export default function App() {
  return (
    <div className="min-h-full text-slate-100 overflow-x-hidden">
      <header className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="container-padded flex h-14 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold tracking-tight"
          >
            <img
              src="https://i.imgur.com/cQvZPEm.png"
              alt="Fynix logo"
              className="h-5 w-auto select-none"
              loading="eager"
              decoding="async"
            />
            Fynix
          </Link>
          <nav className="flex gap-2">
            <Link className="btn-muted" to="/">
              Home
            </Link>
            <Link className="btn-muted" to="/dashboard">
              Dashboard
            </Link>
            <Link className="btn-muted" to="/docs">
              Docs
            </Link>
            <Link className="btn-muted" to="/tools">
              Tools
            </Link>
            <Link className="btn-muted" to="/onboarding">
              Onboarding
            </Link>
            <Link className="btn-muted" to="/fynix-daily">
              Fynix Daily
            </Link>
            <Link className="btn-muted" to="/pricing">
              Pricing
            </Link>
            <Link className="btn-muted" to="/blog">
              Blog
            </Link>
            <Link className="btn-muted" to="/about">
              About
            </Link>
            <Link className="btn-muted" to="/contact">
              Contact
            </Link>
            <Link className="btn-muted" to="/billing">
              Billing
            </Link>
            <Link className="btn-muted" to="/login">
              Login
            </Link>
            <Link className="btn-muted" to="/profile">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/docs/:slug" element={<Docs />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/fynix-daily" element={<Phoenix />} />
        <Route
          path="/phoenix"
          element={<Navigate to="/fynix-daily" replace />}
        />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
