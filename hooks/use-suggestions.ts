import { useQuery } from "@tanstack/react-query"
import type { TagType } from "@/store/formula-store"

const API_URL = process.env.NEXT_PUBLIC_AUTO_COMPLETE_URL as string

const fetchSuggestions = async (query: string): Promise<TagType[]> => {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    const data: TagType[] = await response.json()

    if (!query) return data

    return data.filter(
      (suggestion) =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(query.toLowerCase()),
    )
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    throw error
  }
}

export function useSuggestions(query: string, enabled = true) {
  return useQuery({
    queryKey: ["suggestions", query],
    queryFn: () => fetchSuggestions(query),
    enabled,
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  })
}
