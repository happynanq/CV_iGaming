"use client";

type ModalProps = {
  winTypes: string[];
  onClose: () => void;
};

const getWinContent = (type: string) => {
  if (type === "resume") {
    return {
      title: "Карьерный путь",
      description:
        "Здесь появится подробное описание моего карьерного пути и связи с технологиями.",
    };
  }

  return {
    title: `Победа: ${type}`,
    description: "Подробное описание этого типа победы появится здесь.",
  };
};

export default function Modal({ winTypes, onClose }: ModalProps) {
  const content = (winTypes.length > 0 ? winTypes : ["default"]).map(
    getWinContent,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="win-modal-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-purple-400/40 bg-[#1b1425] p-6 text-white shadow-2xl"
        role="dialog"
      >
        <h2 id="win-modal-title" className="mb-4 text-2xl font-bold">
          Победа!
        </h2>

        <div className="space-y-4">
          {content.map(({ title, description }, index) => (
            <article key={`${title}-${index}`}>
              <h3 className="font-semibold text-purple-200">{title}</h3>
              <p className="mt-1 text-sm text-neutral-300">{description}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-bold text-white hover:bg-purple-500"
        >
          Продолжить
        </button>
      </section>
    </div>
  );
}