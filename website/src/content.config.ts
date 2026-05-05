import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const info = defineCollection({
    loader: glob({ pattern: "*.md", base: "./src/content/info" }),
});

export const collections = { info };
