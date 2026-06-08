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
    // Site stays static; only routes that opt out of prerendering (the signup
    // API) are rendered on-demand by the Node server.
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
        // The .env lives in src/, not the project root, so point Vite there.
        envDir: "src",
        server: {
            allowedHosts: true,
        },
        plugins: [tailwindcss()],
    },
});
