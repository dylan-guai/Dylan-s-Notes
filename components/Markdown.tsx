import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a Markdown string (produced by notion-to-md) into the reading prose.
 * External links open in a new tab; internal links stay in-app. Notion image
 * URLs expire (~1h) but ISR re-fetches them on each revalidation, so images
 * are rendered as plain <img> straight from Markdown.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href, children }) {
          const external = !!href && /^https?:\/\//.test(href);
          return (
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          );
        },
        // eslint-disable-next-line @next/next/no-img-element
        img: (props) => <img {...props} alt={props.alt ?? ""} loading="lazy" />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
