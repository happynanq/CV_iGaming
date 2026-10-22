import Preloader from "@/components/slot/Preloader";
import SlotGame from "@/components/slot/SlotGameClient";
import SlotLoader from "@/components/slot/SlotLoader";
import GameDebug from "@/components/slot/utils/dev/GameDebug";
import Image from "next/image";

export default function Home() {
  return (
    <main className="text-center"> 
      Kirill Aleksandrov - Frontend Developer 
        <SlotGame/>
    </main>
  );
}
