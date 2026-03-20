export const capitalizeFirstLetter = (value: string) => {
  const chars = [...value];
  for (let i = 0; i < chars.length; i += 1) {
    const ch = chars[i];
    if (/[A-Za-z]/.test(ch)) {
      chars[i] = ch.toUpperCase();
      break;
    }
  }
  return chars.join("");
};
