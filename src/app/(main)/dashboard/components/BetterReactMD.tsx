"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface BetterReactMDProps {
  content: string;
}

export default function BetterReactMD({ content }: BetterReactMDProps) {
  return (
    <div className="text-sm leading-relaxed [&_code]:rounded [&_code]:border [&_code]:border-neutral-700/50 [&_code]:bg-neutral-800 [&_code]:text-white [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: (props) => (
            <h1
              className="mt-2 mb-4 border-b border-neutral-800 pb-2 text-2xl font-bold"
              {...props}
            />
          ),
          h2: (props) => (
            <h2 className="mt-6 mb-3 text-xl font-bold" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-4 mb-2 text-lg font-semibold" {...props} />
          ),
          h4: (props) => (
            <h4 className="mt-4 mb-2 text-base font-semibold" {...props} />
          ),
          p: (props) => <div className="mb-4 last:mb-0" {...props} />,
          ul: (props) => (
            <ul
              className="mb-4 ml-5 list-inside list-disc space-y-1 marker:text-neutral-500"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="mb-4 ml-5 list-inside list-decimal space-y-1 marker:text-neutral-500"
              {...props}
            />
          ),
          li: (props) => <li className="pl-1" {...props} />,
          hr: (props) => <hr className="my-6 border-neutral-800" {...props} />,
          strong: (props) => <strong className="font-bold" {...props} />,
          a: (props) => (
            <a
              className="font-medium text-(--tyrestats-blue) transition-colors hover:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="my-4 rounded-r border-l-4 border-(--tyrestats-blue) bg-neutral-900/50 py-1 pl-4 italic"
              {...props}
            />
          ),
          pre: (props) => (
            <div className="my-4 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
              <pre
                className="overflow-x-auto p-4 font-mono text-sm"
                {...props}
              />
            </div>
          ),
          code: (props) => <code {...props} />,
          table: (props) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-neutral-800 font-semibold" {...props} />
          ),
          tbody: (props) => (
            <tbody
              className="divide-y divide-neutral-800 bg-neutral-900/30"
              {...props}
            />
          ),
          tr: (props) => (
            <tr
              className="transition-colors hover:bg-neutral-800/50"
              {...props}
            />
          ),
          th: (props) => (
            <th className="px-4 py-3 whitespace-nowrap text-white" {...props} />
          ),
          td: (props) => <td className="px-4 py-3 align-top" {...props} />,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="my-4 h-auto max-w-full rounded-lg border border-neutral-800"
              {...props}
              alt={props.alt || ""}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
