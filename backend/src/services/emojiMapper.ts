const EMOJI_MAP: Record<string, string> = {
  // Geld & Erfolg
  geld: "💰", reich: "💎", millionen: "💰", million: "💰", erfolg: "🏆",
  gewinn: "💵", verdienen: "💵", profit: "💵", reichtum: "💎",
  // Energie & Stärke
  feuer: "🔥", boom: "💥", krass: "🔥", stark: "💪", power: "💪",
  energie: "⚡", schnell: "⚡", extrem: "🔥", mega: "🔥",
  // Positiv
  liebe: "❤️", herz: "❤️", glück: "🍀", spaß: "😄", wow: "🤩",
  perfekt: "✅", genial: "🧠", super: "⭐", hammer: "🔨",
  // Negativ
  problem: "❌", fehler: "❌", niemals: "🚫", schlecht: "👎",
  // Reise & Lifestyle
  urlaub: "✈️", reise: "✈️", auto: "🚗", haus: "🏠",
  // Fitness
  sport: "🏃", fitness: "💪", training: "🏋️", gym: "🏋️",
  // Tech
  app: "📱", handy: "📱", computer: "💻", internet: "🌐", video: "🎬",
  // Lebensmittel
  essen: "🍕", pizza: "🍕", kaffee: "☕",
  // Lernen
  wissen: "🧠", lernen: "📖", idee: "💡", tipp: "💡",
  // Zahlen (Kontext)
  prozent: "📊", zahl: "📊",
  // English
  money: "💰", rich: "💎", success: "🏆", fire: "🔥", strong: "💪",
  love: "❤️", heart: "❤️", happy: "😄", perfect: "✅",
  travel: "✈️", car: "🚗", house: "🏠",
  phone: "📱", laptop: "💻",
  learn: "📖", idea: "💡",
};

export function getEmojiForWord(word: string): string | undefined {
  const normalized = word.toLowerCase().replace(/[^a-zäöüß]/g, "");
  return EMOJI_MAP[normalized];
}
