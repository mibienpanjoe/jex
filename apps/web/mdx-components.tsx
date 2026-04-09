import { useMDXComponents as getNextraMDXComponents } from "nextra/mdx-components";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...getNextraMDXComponents(),
    ...components,
  };
}
