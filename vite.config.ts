import {defineConfig, type Plugin} from 'vite';
import {minify} from 'html-minifier-terser';

function inlineAndMinifyHtml(): Plugin {
    return {
        name: 'inline-and-minify-html',
        apply: 'build',
        enforce: 'post',
        async transformIndexHtml(html, ctx) {
            if (!ctx.bundle) return html;
            let inlinedHtml = html;

            // 1. Ersätt CSS-länken med inbäddad <style> direkt i HTML
            for (const [fileName, asset] of Object.entries(ctx.bundle)) {
                if (fileName.endsWith('.css') && asset.type === 'asset') {
                    const cssContent = typeof asset.source === 'string' ? asset.source : asset.source.toString();

                    // Ersätt huvudstilmallen
                    inlinedHtml = inlinedHtml.replace(
                        new RegExp(`<link[^>]*href="[^"]*${fileName}"[^>]*>`, 'i'),
                        `<style>${cssContent}</style>`
                    );

                    // Radera den separata .css-filen ur dist-mappen så det inte blir onödig dubblerad kod
                    delete ctx.bundle[fileName];
                }
            }

            // 2. Minifiera HTML för maximal överföringshastighet
            return await minify(inlinedHtml, {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                minifyCSS: true
            });
        }
    };
}

export default defineConfig({
    base: './',
    root: './',
    publicDir: 'public',
    plugins: [inlineAndMinifyHtml()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022',
        cssCodeSplit: false // Samlar all CSS i ett paket för optimal inlining
    }
});