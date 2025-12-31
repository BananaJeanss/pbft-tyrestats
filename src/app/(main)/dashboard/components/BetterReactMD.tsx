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
    <div className="text-neutral-200 text-sm leading-relaxed [&_code]:bg-neutral-800 [&_code]:text-neutral-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_code]:border [&_code]:border-neutral-700/50 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:border-0 [&_pre_code]:text-inherit">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: (props) => (
            <h1
              className="text-2xl font-bold text-white mt-2 mb-4 pb-2 border-b border-neutral-800"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="text-xl font-bold text-white mt-6 mb-3"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="text-lg font-semibold text-neutral-100 mt-4 mb-2"
              {...props}
            />
          ),
          h4: (props) => (
            <h4
              className="text-base font-semibold text-neutral-100 mt-4 mb-2"
              {...props}
            />
          ),
          p: (props) => <div className="mb-4 last:mb-0" {...props} />,
          ul: (props) => (
            <ul
              className="list-disc list-inside ml-5 mb-4 space-y-1 marker:text-neutral-500"
              {...props}
            />
          ),
          ol: (props) => (
            <ol
              className="list-decimal list-inside ml-5 mb-4 space-y-1 marker:text-neutral-500"
              {...props}
            />
          ),
          li: (props) => <li className="pl-1" {...props} />,
          hr: (props) => (
            <hr className="border-neutral-800 my-6" {...props} />
          ),
          strong: (props) => (
            <strong className="font-bold text-white" {...props} />
          ),
          a: (props) => (
            <a
              className="text-(--tyrestats-blue) hover:underline hover:text-blue-400 transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-4 border-(--tyrestats-blue) pl-4 py-1 my-4 bg-neutral-900/50 italic text-neutral-400 rounded-r"
              {...props}
            />
          ),
          pre: (props) => (
            <div className="my-4 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900">
               <pre className="p-4 overflow-x-auto text-sm text-neutral-300 font-mono" {...props} />
            </div>
          ),
          code: (props) => <code {...props} />,
          table: (props) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-neutral-800">
              <table className="w-full text-left text-sm" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="bg-neutral-800 text-neutral-200 font-semibold" {...props} />
          ),
          tbody: (props) => (
            <tbody className="divide-y divide-neutral-800 bg-neutral-900/30" {...props} />
          ),
          tr: (props) => (
            <tr className="hover:bg-neutral-800/50 transition-colors" {...props} />
          ),
          th: (props) => (
            <th className="px-4 py-3 whitespace-nowrap" {...props} />
          ),
          td: (props) => (
            <td className="px-4 py-3 align-top" {...props} />
          ),
          img: (props) => (
             // eslint-disable-next-line @next/next/no-img-element
            <img className="max-w-full h-auto rounded-lg my-4 border border-neutral-800" {...props} alt={props.alt || ''} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}