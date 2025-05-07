import { create } from "zustand"
import { devtools } from "zustand/middleware"

// Define the types for our tags and suggestions
export type TagType = {
  id: string
  name: string
  category: string
  value: string | number
  inputs?: string
}

export type FormulaItem =
  | { type: "tag"; tag: TagType }
  | { type: "text"; text: string }
  | { type: "operator"; operator: string }
  | { type: "number"; value: number }

interface FormulaState {
  items: FormulaItem[]
  activeIndex: number | null
  inlineEditIndex: number | null
  inlineText: string
  inputValue: string
  showSuggestions: boolean
  result: number | null

  // Actions
  setItems: (items: FormulaItem[]) => void
  addItem: (item: FormulaItem, index?: number) => void
  removeItem: (index: number) => void
  updateItem: (index: number, item: FormulaItem) => void
  setActiveIndex: (index: number | null) => void
  setInlineEditIndex: (index: number | null) => void
  setInlineText: (text: string) => void
  setInputValue: (value: string) => void
  setShowSuggestions: (show: boolean) => void
  setResult: (result: number | null) => void
  calculateResult: () => void
}

// Parse value to number for calculation
const parseValue = (value: string | number): number => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    try {
      // First check if it's a simple number
      const simpleNumber = Number(value)
      if (!isNaN(simpleNumber)) {
        return simpleNumber
      }

      // If it contains math operators, try to evaluate it
      if (/[+\-*/()]/.test(value)) {
        // eslint-disable-next-line no-eval
        return eval(value)
      }
    } catch (e) {
      console.error("Error parsing value:", e)
    }
  }

  return 0
}

export const useFormulaStore = create<FormulaState>()(
  devtools(
    (set, get) => ({
      items: [],
      activeIndex: null,
      inlineEditIndex: null,
      inlineText: "",
      inputValue: "",
      showSuggestions: false,
      result: null,

      setItems: (items) => set({ items }),

      addItem: (item, index) => {
        const { items, activeIndex } = get()
        const newItems = [...items]

        // If index is provided, insert at that index
        if (index !== undefined) {
          newItems.splice(index, 0, item)
          set({ items: newItems, activeIndex: index + 1 })
        }
        // If activeIndex is set, insert at that position
        else if (activeIndex !== null) {
          newItems.splice(activeIndex, 0, item)
          set({ items: newItems, activeIndex: activeIndex + 1 })
        }
        // Otherwise, append to the end
        else {
          newItems.push(item)
          set({ items: newItems, activeIndex: newItems.length })
        }

        // Calculate the result after adding an item
        get().calculateResult()
      },

      removeItem: (index) => {
        const { items, activeIndex } = get()
        const newItems = [...items]
        newItems.splice(index, 1)

        // Adjust activeIndex if needed
        let newActiveIndex = activeIndex
        if (activeIndex !== null && activeIndex > index) {
          newActiveIndex = activeIndex - 1
        }

        set({ items: newItems, activeIndex: newActiveIndex })
        get().calculateResult()
      },

      updateItem: (index, item) => {
        const { items } = get()
        const newItems = [...items]
        newItems[index] = item
        set({ items: newItems })
        get().calculateResult()
      },

      setActiveIndex: (index) => set({ activeIndex: index }),
      setInlineEditIndex: (index) => set({ inlineEditIndex: index }),
      setInlineText: (text) => set({ inlineText: text }),
      setInputValue: (value) => set({ inputValue: value }),
      setShowSuggestions: (show) => set({ showSuggestions: show }),
      setResult: (result) => set({ result }),

      calculateResult: () => {
        const { items } = get()

        try {
          // Convert formula items to a calculable expression
          let expression = ""

          items.forEach((item) => {
            if (item.type === "tag") {
              // Parse the value from the tag
              expression += parseValue(item.tag.value)
            } else if (item.type === "operator") {
              // Replace ^ with ** for exponentiation
              if (item.operator === "^") {
                expression += "**"
              } else {
                expression += item.operator
              }
            } else if (item.type === "text") {
              // Try to parse numbers from text
              const num = Number.parseFloat(item.text)
              if (!isNaN(num)) {
                expression += num
              }
            } else if (item.type === "number") {
              // Directly use the number value
              expression += item.value
            }
          })

          // Only evaluate if we have a valid expression
          if (expression) {
            // eslint-disable-next-line no-eval
            const calculatedResult = eval(expression)
            set({ result: calculatedResult })
          } else {
            set({ result: null })
          }
        } catch (error) {
          console.error("Calculation error:", error)
          set({ result: null })
        }
      },
    }),
    { name: "formula-store" },
  ),
)
