export interface Memory { src: string; cap: string; date: string }
export interface Wish { t: string; m: string }
export interface Content {
  name: string; dateLabel: string; sub: string; portrait: string; homeMsg: string; music: string;
  memories: Memory[]; reasons: string[]; letter: string[]; signature: string;
  gift: { title: string; msg: string; photo: string; links: { label: string; url: string }[] };
  wishes: Wish[]; hugMsg: string;
}
export type ViewId = "open" | "home" | "memories" | "reasons" | "letter" | "surprise" | "wishes" | "fin";
export const NAV: { id: ViewId; label: string }[] = [
  { id: "home", label: "Birthday Home" }, { id: "memories", label: "Our Memories" },
  { id: "reasons", label: "21 Things I Love" }, { id: "letter", label: "My Letter" },
  { id: "surprise", label: "Your Surprise" }, { id: "wishes", label: "Chapter 21" },
];
