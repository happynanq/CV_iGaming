"use client";

import { cvContent, winContentByType } from "./data";

type ModalProps = {
  winTypes: string[];
  onClose: () => void;
};

export default function Modal({ winTypes, onClose }: ModalProps) {
  const header = cvContent.find((block) => block.type === "header");
  const sections = [...new Set(winTypes)].map((type) => ({
    type,
    content: winContentByType[type],
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <section
        aria-labelledby="win-modal-title"
        aria-modal="true"
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-purple-400/40 bg-[#1b1425] text-left text-white shadow-2xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-purple-300">
              Portfolio unlocked
            </p>
            <h2 id="win-modal-title" className="mt-1 text-2xl font-bold">
              {header?.type === "header" ? header.text : "Portfolio"}
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              {header?.type === "header" ? header.subtitle : null}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close portfolio"
            className="rounded-lg px-3 py-2 text-neutral-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="max-h-[calc(85vh-160px)] space-y-5 overflow-y-auto px-6 py-5">
          {sections.map(({ type, content }) => (
            <section key={type} aria-label={content?.title ?? type}>
              <h3 className="mb-3 border-b border-white/10 pb-2 text-lg font-semibold text-purple-200">
                {content?.title ?? `Unknown win type: ${type}`}
              </h3>
              {content ? (
                <div className="space-y-4">
                  {content.blocks.map((block, index) => {
                    const key = `${type}-${block.type}-${index}`;

                    switch (block.type) {
                      case "header":
                      case "section":
                        return null;
                      case "summary":
                        return (
                          <p
                            key={key}
                            className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-4 leading-relaxed text-neutral-200"
                          >
                            {block.text}
                          </p>
                        );
                      case "experience":
                        return (
                          <article key={key} className="space-y-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <h4 className="font-semibold text-white">
                                {block.company}
                              </h4>
                              {block.period && (
                                <span className="text-xs text-purple-300">
                                  {block.period}
                                </span>
                              )}
                            </div>
                            <p className="text-sm leading-relaxed text-neutral-300">
                              {block.text}
                            </p>
                          </article>
                        );
                      case "skills":
                        return (
                          <p key={key} className="text-sm leading-relaxed">
                            {block.category && (
                              <span className="font-semibold text-white">
                                {block.category}:{" "}
                              </span>
                            )}
                            <span className="text-neutral-300">
                              {block.text}
                            </span>
                          </p>
                        );
                      case "achievements":
                      case "education":
                        return (
                          <p key={key} className="text-sm leading-relaxed">
                            {block.period && (
                              <span className="mr-2 text-purple-300">
                                {block.period}
                              </span>
                            )}
                            <span className="text-neutral-300">
                              {block.text}
                            </span>
                          </p>
                        );
                      case "contact":
                        return (
                          <a
                            key={key}
                            href={block.url}
                            target={
                              block.url?.startsWith("https://")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              block.url?.startsWith("https://")
                                ? "noreferrer"
                                : undefined
                            }
                            className="mr-4 inline-block text-sm text-purple-200 underline decoration-purple-400/40 underline-offset-4 hover:text-white"
                          >
                            {block.text}
                          </a>
                        );
                    }
                  })}
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  No portfolio content is configured for this server win type.
                </p>
              )}
            </section>
          ))}
        </div>

        <footer className="border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500"
          >
            Continue
          </button>
        </footer>
      </section>
    </div>
  );
}
