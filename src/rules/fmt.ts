// one decimal place for numbers shown to people: 36.66666 -> "36.7", 480 -> "480"
export const n1 = (x: number): string => String(Math.round(x * 10) / 10);
export const n2 = (x: number): string => String(Math.round(x * 100) / 100);
