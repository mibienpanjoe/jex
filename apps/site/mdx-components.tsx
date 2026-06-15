import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(
  components: MDXComponents = {},
): MDXComponents {
  return {
    h1: (props) => <h1 {...props} />,
    h2: (props) => <h2 {...props} />,
    h3: (props) => <h3 {...props} />,
    p: (props) => <p {...props} />,
    a: ({ href = "", ...props }) => <Link href={href} {...props} />,
    ul: (props) => <ul {...props} />,
    ol: (props) => <ol {...props} />,
    li: (props) => <li {...props} />,
    code: (props) => <code {...props} />,
    pre: (props) => <pre {...props} />,
    blockquote: (props) => <blockquote {...props} />,
    table: (props) => <table {...props} />,
    th: (props) => <th {...props} />,
    td: (props) => <td {...props} />,
    ...components,
  };
}
