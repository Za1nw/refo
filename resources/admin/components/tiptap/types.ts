// Minimal TipTap-like editor interface to avoid importing external types
// Extend as needed for additional commands used by controls
export interface EditorLike {
  chain: () => any; // command chain; treated as dynamic for flexibility
  isActive: (...args: any[]) => boolean;
  can?: () => { undo?: () => boolean; redo?: () => boolean };
  getAttributes?: (name: string) => any;
  on?: (event: string, cb: (...args: any[]) => void) => void;
  off?: (event: string, cb: (...args: any[]) => void) => void;
  focus?: () => any;
  state?: any;
  view?: any;
}

export type TextAlignValue = "left" | "right" | "center" | "justify";
export type HeadingValue = "paragraph" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
