import AppHeader from "./components/Header";

import "./app.scss";
import MusicBar from "./components/MusicBar";
import { Outlet } from "react-router";

export default function App() {
  return (
    <div className="app-container">
      <AppHeader></AppHeader>
      <div className="body-container">
        <Outlet></Outlet>
      </div>
      <MusicBar></MusicBar>
    </div>
  );
}
