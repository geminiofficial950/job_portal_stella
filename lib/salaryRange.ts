export function parseSalaryRange(value: string) {
  const match = /^AUD\s+(\d*k?)\s*[-\u2013]\s*(\d*k?)\s*\/\s*year$/i.exec(value.trim());
  const amount = (part: string) => part ? String(Number(part.replace(/k$/i, "")) * (/k$/i.test(part) ? 1000 : 1)) : "";
  if (match) return { min: amount(match[1]), max: amount(match[2]) };
  const openRange = /^AUD\s+(\d+)k\+\s*\/\s*year$/i.exec(value.trim());
  return { min: openRange ? String(Number(openRange[1]) * 1000) : "", max: "" };
}

export function isValidSalaryExpectation(value: string) {
  const { min, max } = parseSalaryRange(value);
  return Boolean(min && max && Number.isSafeInteger(Number(min)) && Number.isSafeInteger(Number(max)) && Number(min) > 0 && Number(max) >= Number(min) && Number(max) <= 100000000);
}
