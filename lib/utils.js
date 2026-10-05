export function getImageUrl(path) {
  if (!path) return "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop"; // Default Cyber Fallback
  if (path.startsWith("http")) return path;
  
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://cessaland.ir/api").replace("/api", "");
  return `${baseUrl}${path}`;
}