export function chunkSlackLines(lines: string[], maxLength = 2900) {
  const sections: string[] = [];
  let current = "";

  for (const line of lines) {
    const safeLine = line.slice(0, maxLength);
    const candidate = current ? `${current}\n${safeLine}` : safeLine;

    if (candidate.length > maxLength && current) {
      sections.push(current);
      current = safeLine;
    } else {
      current = candidate;
    }
  }

  if (current) sections.push(current);
  return sections;
}
