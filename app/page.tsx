import Image from "next/image";
import Homepage from "./pages/Homepage";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Homepage/>
    </>
  );
}
