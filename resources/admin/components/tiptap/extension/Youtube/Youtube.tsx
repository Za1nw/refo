import { mergeAttributes, Node } from "@tiptap/core";
import { getEmbedYoutubeUrl, isValidYoutubeUrl } from "./utils";

export interface YoutubeOptions {
    allowFullscreen?: boolean;
    autoplay?: boolean;
    nocookie?: boolean;
    controls?: boolean;
    HTMLAttributes: {
        [key: string]: any;
    };
}

type EmbedYoutubeOptions = {
    src: string;
    width?: number;
    height?: number;
    widthUnit?: "px" | "%";
    heightUnit?: "px" | "%";
    textAlign?: "left" | "right" | "center" | "justify" | string | null;
    title?: string;
    loading?: "lazy" | "eager" | string;
    referrerpolicy?: string;
    frameborder?: string; // deprecated, ignored on render
    allowfullscreen?: boolean;
    autoplay?: boolean;
    controls?: boolean;
    nocookie?: boolean;
};

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        youtube: {
            embedYoutube: (options: EmbedYoutubeOptions) => ReturnType;
        };
    }
}

export const Youtube = Node.create<YoutubeOptions>({
    name: "youtube",
    group: "block",
    draggable: true,
    atom: true,

    addOptions() {
        return {
            allowFullscreen: true,
            autoplay: false,
            nocookie: false,
            controls: true,
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            src: { default: null },
            width: { default: 560 },
            widthUnit: { default: "px" },
            height: { default: 315 },
            heightUnit: { default: "px" },
            title: { default: null },
            frameborder: { default: "0" }, // ignored in render
            loading: { default: "lazy" },
            referrerpolicy: { default: "strict-origin-when-cross-origin" },
            textAlign: {
                default: null,
                parseHTML: (element) => element.style.textAlign || null,
                renderHTML: (attributes) =>
                    attributes.textAlign
                        ? { style: `text-align: ${attributes.textAlign};` }
                        : {},
            },
            allowfullscreen: { default: null },
            autoplay: { default: null },
            controls: { default: null },
            nocookie: { default: null },
        };
    },

    parseHTML() {
        return [
            {
                tag: "div",
                getAttrs: (node) => {
                    if (node instanceof HTMLElement && node.querySelector("iframe")) {
                        const iframe = node.querySelector("iframe");
                        return {
                            src: iframe?.getAttribute("src"),
                            width: iframe?.getAttribute("width") || 560,
                            height: iframe?.getAttribute("height") || 315,
                            textAlign: node.style.textAlign || null,
                            allowfullscreen: iframe?.hasAttribute("allowfullscreen") || null,
                        };
                    }
                    return false;
                },
            },
            {
                tag: "iframe[src]",
                getAttrs: (node) => {
                    if (node instanceof HTMLElement) {
                        const parent = node.parentElement;
                        let textAlign = null;
                        if (parent && parent.tagName === "DIV") {
                            textAlign = parent.style.textAlign || null;
                        }
                        return {
                            src: node.getAttribute("src"),
                            width: node.getAttribute("width") || 560,
                            height: node.getAttribute("height") || 315,
                            textAlign,
                            allowfullscreen: node.hasAttribute("allowfullscreen") || null,
                        };
                    }
                    return false;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const {
            textAlign,
            width,
            widthUnit,
            height,
            heightUnit,
            title,
            loading,
            referrerpolicy,
            style,
            ...rest
        } = HTMLAttributes;
        console.log(HTMLAttributes);


        // نخلي باقي الخصائص على الـiframe
        let iframeAttrs: any = {
            ...this.options.HTMLAttributes,
            ...rest,
            src: HTMLAttributes.src,
            title,
            loading,
            referrerpolicy,
            style: "border:0;display:inline-block;",
        };

        const allowFs =
            (HTMLAttributes as any).allowfullscreen ?? this.options.allowFullscreen;
        if (allowFs) {
            iframeAttrs.allowfullscreen = "";
        }

        if (widthUnit === "%") {
            iframeAttrs.style += `width:${width}%;`;
        } else {
            iframeAttrs.width = width;
        }
        if (heightUnit === "%") {
            iframeAttrs.style += `height:${height}%;`;
        } else {
            iframeAttrs.height = height;
        }

        return [
            "div",
            { style: style},
            ["iframe", mergeAttributes(iframeAttrs)]
        ];

    },

    addCommands() {
        return {
            embedYoutube:
                (options: EmbedYoutubeOptions) =>
                    ({ commands }) => {
                        const allowfullscreen =
                            options.allowfullscreen ?? this.options.allowFullscreen;
                        const autoplay = options.autoplay ?? this.options.autoplay;
                        const controls = options.controls ?? this.options.controls;
                        const nocookie = options.nocookie ?? this.options.nocookie;

                        const isEmbed =
                            /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[A-Za-z0-9_-]+/.test(
                                options.src
                            );
                        const valid = isEmbed || isValidYoutubeUrl(options.src);
                        if (!valid) return false;

                        const embedUrl = isEmbed
                            ? options.src
                            : getEmbedYoutubeUrl({
                                url: options.src,
                                autoplay,
                                controls,
                                nocookie,
                            });

                        if (!embedUrl) return false;

                        const attrs = {
                            width: options.width ?? 560,
                            height: options.height ?? 315,
                            widthUnit: options.widthUnit ?? "px",
                            heightUnit: options.heightUnit ?? "px",
                            textAlign: options.textAlign ?? "center",
                            title: options.title,
                            loading: options.loading,
                            referrerpolicy: options.referrerpolicy,
                            allowfullscreen,
                            autoplay,
                            controls,
                            nocookie,
                        };

                        return commands.insertContent({
                            type: this.name,
                            attrs: { ...attrs, src: embedUrl },
                        });
                    },
        };
    },

    addNodeView() {
        const { allowFullscreen } = this.options;
        return ({ node }) => {
            const iframe = document.createElement("iframe");
            iframe.src = node.attrs.src;
            if (node.attrs.title) iframe.title = node.attrs.title;
            if (node.attrs.loading) iframe.setAttribute("loading", node.attrs.loading);
            if (node.attrs.referrerpolicy)
                iframe.setAttribute("referrerpolicy", node.attrs.referrerpolicy);

            const allowFs = (node.attrs.allowfullscreen ?? allowFullscreen) ? true : false;
            if (allowFs) {
                iframe.setAttribute("allowfullscreen", "");
            } else {
                iframe.removeAttribute("allowfullscreen");
            }

            if (node.attrs.widthUnit === "%") {
                iframe.style.width = `${node.attrs.width}%`;
                iframe.removeAttribute("width");
            } else {
                iframe.width = node.attrs.width || 560;
                iframe.style.width = "";
            }
            if (node.attrs.heightUnit === "%") {
                iframe.style.height = `${node.attrs.height}%`;
                iframe.removeAttribute("height");
            } else {
                iframe.height = node.attrs.height || 315;
                iframe.style.height = "";
            }

            iframe.style.border = "0";
            iframe.style.display = "inline-block";

            const wrapper = document.createElement("div");
            if (node.attrs.textAlign) {
                wrapper.style.textAlign = node.attrs.textAlign;
            }
            wrapper.appendChild(iframe);

            return {
                dom: wrapper,
                contentDOM: null,
            };
        };
    },
});
