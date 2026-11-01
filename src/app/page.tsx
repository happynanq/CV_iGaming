import ThreeScene from "@/components/ThreeScene";

export default function Home() {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#101014] text-center text-[#fff8e9]">
      <ThreeScene />
      <h1 className="pointer-events-none absolute inset-x-4 top-8 z-10 text-sm font-medium tracking-[0.2em] sm:text-base">
        Kirill Aleksandrov - Frontend Developer
      </h1>
    </main>
  );
}
