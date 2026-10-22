"use client";

import dynamic from "next/dynamic";

const SlotGame = dynamic(() => import("./SlotGame"), {
  ssr: false,
  loading: () => <p className="text-neutral-400">Loading slot game...</p>,
});

export default SlotGame;
