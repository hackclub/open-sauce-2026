// @ts-check
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";

function remarkDraft() {
    return (tree, file) => {
        if (!file.data.astro?.frontmatter?.draft) return;

        const firstH1Index = tree.children.findIndex(
            (n) => n.type === "heading" && n.depth === 1,
        );
        const wipParagraph = {
            type: "paragraph",
            children: [{ type: "text", value: "WIP" }],
        };

        tree.children =
            firstH1Index === -1
                ? [wipParagraph]
                : [tree.children[firstH1Index], wipParagraph];
    };
}

// https://astro.build/config
export default defineConfig({
    // Static site served by a standalone Node server in the container; pages
    // are prerendered, the adapter just provides the runtime to serve them.
    adapter: node({ mode: "standalone" }),
    markdown: {
        remarkPlugins: [remarkDraft],
        rehypePlugins: [
            [
                rehypeExternalLinks,
                { target: "_blank", rel: ["noopener", "noreferrer"] },
            ],
        ],
    },
    vite: {
        server: {
            allowedHosts: true,
        },
        plugins: [tailwindcss()],
    },
});
