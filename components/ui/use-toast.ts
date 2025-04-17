export function toast({
  title,
  description,
  variant = "default",
}: {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}) {
  // In a real implementation, this would use a proper toast system
  // For now, we'll just use alert for simplicity
  const message = [title, description].filter(Boolean).join("\n")
  alert(message)
}
