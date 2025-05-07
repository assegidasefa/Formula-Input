"use client"

import React, { useRef, useEffect, type KeyboardEvent } from "react"
import { Calendar, DollarSign, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSuggestions } from "@/hooks/use-suggestions"
import { useFormulaStore, type TagType } from "@/store/formula-store"

export default function FormulaInput() {
  const {
    items,
    activeIndex,
    inlineEditIndex,
    inlineText,
    inputValue,
    showSuggestions,
    result,
    setItems,
    addItem,
    removeItem,
    updateItem,
    setActiveIndex,
    setInlineEditIndex,
    setInlineText,
    setInputValue,
    setShowSuggestions,
    calculateResult,
  } = useFormulaStore()

  const { data: suggestions = [], isLoading, error } = useSuggestions(inputValue, showSuggestions)

  const inputRef = useRef<HTMLInputElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const formulaContainerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null )[]>([])

  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
  }

  const handleInlineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInlineText(e.target.value)
  }

  const handleSelectSuggestion = (suggestion: TagType) => {
    addItem({ type: "tag", tag: suggestion })
    setInputValue("")
    setShowSuggestions(false)

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 0)
  }

 
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    
    if (e.key === "ArrowLeft" && activeIndex !== null && activeIndex > 0) {
      e.preventDefault()
      setActiveIndex(activeIndex - 1)
      return
    }

   
    if (e.key === "ArrowRight" && activeIndex !== null && activeIndex < items.length) {
      e.preventDefault()
      setActiveIndex(activeIndex + 1)
      return
    }

   
    if (["+", "-", "*", "/", "(", ")", "^"].includes(e.key)) {
      e.preventDefault()
      addItem({ type: "operator", operator: e.key })
      return
    }

    
    if (/^[0-9]$/.test(e.key)) {
      
      if (!inputValue) {
        e.preventDefault()
        const numberValue = Number.parseInt(e.key, 10)
        addItem({ type: "number", value: numberValue })
        return
      }
      
      return
    }

    
    if (e.key === " " && inputValue.trim()) {
      e.preventDefault()

      
      const num = Number(inputValue.trim())
      const isNumber = !isNaN(num)

      if (isNumber) {
        addItem({ type: "number", value: num })
      } else {
        addItem({ type: "text", text: inputValue.trim() })
      }

      setInputValue("")
      return
    }

    
    if (e.key === "Enter") {
      e.preventDefault()

      if (showSuggestions && suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0])
      } else if (inputValue.trim()) {
       
        const num = Number(inputValue.trim())
        const isNumber = !isNaN(num)

        if (isNumber) {
          addItem({ type: "number", value: num })
        } else {
          addItem({ type: "text", text: inputValue.trim() })
        }

        setInputValue("")
      }
      return
    }

    
    if (e.key === "Backspace" && !inputValue) {
      e.preventDefault()
      if (items.length > 0 && activeIndex !== null && activeIndex > 0) {
        removeItem(activeIndex - 1)
        setActiveIndex(activeIndex - 1)
      }
      return
    }
  }

  
  const handleInlineKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitInlineEdit(index)
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelInlineEdit()
    }
  }

  
  const startInlineEdit = (index: number, initialText = "") => {
    setInlineEditIndex(index)
    setInlineText(initialText)

    
    setTimeout(() => {
      if (inlineInputRef.current) {
        inlineInputRef.current.focus()
      }
    }, 0)
  }

  
  const commitInlineEdit = (index: number) => {
    if (inlineText.trim()) {
      
      const num = Number(inlineText.trim())
      const isNumber = !isNaN(num)

      if (isNumber) {
        updateItem(index, { type: "number", value: num })
      } else {
        updateItem(index, { type: "text", text: inlineText.trim() })
      }
    } else {
      
      removeItem(index)
    }

    setInlineEditIndex(null)
    setInlineText("")
  }

  
  const cancelInlineEdit = () => {
    setInlineEditIndex(null)
    setInlineText("")
  }

 
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!formulaContainerRef.current) return

   
    if ((e.target as HTMLElement).closest(".formula-item")) return

    const containerRect = formulaContainerRef.current.getBoundingClientRect()
    const clickX = e.clientX - containerRect.left

    
    let closestIndex = items.length 
    let closestDistance = Number.POSITIVE_INFINITY

    itemsRef.current.forEach((itemRef, index) => {
      if (!itemRef) return

      const itemRect = itemRef.getBoundingClientRect()
      const itemCenterX = itemRect.left + itemRect.width / 2 - containerRect.left

      
      if (clickX < itemCenterX) {
        const distance = Math.abs(clickX - (itemRect.left - containerRect.left))
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      }

      
      if (clickX >= itemCenterX && index === items.length - 1) {
        const distance = Math.abs(clickX - (itemRect.right - containerRect.left))
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index + 1
        }
      }
    })

    
    setActiveIndex(closestIndex)

    
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [setShowSuggestions])

  
  useEffect(() => {
    if (activeIndex === null && items.length >= 0) {
      setActiveIndex(items.length)
    }
  }, [activeIndex, items.length, setActiveIndex])

  
  const handlePositionClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation() 
    setActiveIndex(index)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  
  const handleTextDoubleClick = (index: number, text: string, e: React.MouseEvent) => {
    e.stopPropagation() 
    startInlineEdit(index, text)
  }

  
  const renderIcon = (category: string) => {
    
    if (category.toLowerCase().includes("date") || category.toLowerCase().includes("month")) {
      return <Calendar className="h-4 w-4 mr-1" />
    } else {
      return <DollarSign className="h-4 w-4 mr-1" />
    }
  }

  
  const getTagColor = (category: string): string => {
    if (category.toLowerCase().includes("date") || category.toLowerCase().includes("month")) {
      return "text-purple-500"
    } else if (category.toLowerCase().includes("category")) {
      return "text-blue-500"
    } else {
      return "text-green-500"
    }
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          ref={formulaContainerRef}
          className="flex items-center border border-gray-300 rounded-md p-2 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent"
          onClick={handleContainerClick}
        >
          <span className="text-gray-500 mr-2">=</span>

          <div className="flex flex-wrap items-center flex-1 gap-1">
            {items.map((item, index) => {
              
              const positionClickHandler = (e: React.MouseEvent) => handlePositionClick(index, e)

              return (
                <React.Fragment key={`item-${index}`}>
                  <div
                    className="w-1 h-4 cursor-text"
                    onClick={positionClickHandler}
                    style={{
                      backgroundColor: activeIndex === index ? "#9333ea" : "transparent",
                      width: "2px",
                      marginRight: "2px",
                    }}
                  />

                  {item.type === "tag" && (
                    <div
                      ref={(el) => (itemsRef.current[index] = el)}
                      className={`formula-item flex items-center rounded-md px-2 py-1 ${getTagColor(item.tag.category)} bg-opacity-10 border border-current`}
                    >
                      {renderIcon(item.tag.category)}
                      <span className={getTagColor(item.tag.category)}>{item.tag.name}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="ml-1 focus:outline-none">
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              removeItem(index)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem>Value: {item.tag.value}</DropdownMenuItem>
                          <DropdownMenuItem>Category: {item.tag.category}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {item.type === "operator" && (
                    <span ref={(el) => (itemsRef.current[index] = el)} className="formula-item mx-1 font-medium">
                      {item.operator}
                    </span>
                  )}

                  {item.type === "text" &&
                    (inlineEditIndex === index ? (
                      <input
                        ref={inlineInputRef}
                        type="text"
                        value={inlineText}
                        onChange={handleInlineInputChange}
                        onKeyDown={(e) => handleInlineKeyDown(e, index)}
                        onBlur={() => commitInlineEdit(index)}
                        className="outline-none border-b border-gray-400 min-w-[40px] max-w-[120px]"
                        autoFocus
                      />
                    ) : (
                      <span
                        ref={(el) => (itemsRef.current[index] = el)}
                        className="formula-item text-gray-700 cursor-text"
                        onDoubleClick={(e) => handleTextDoubleClick(index, item.text, e)}
                      >
                        {item.text}
                      </span>
                    ))}

                  {item.type === "number" &&
                    (inlineEditIndex === index ? (
                      <input
                        ref={inlineInputRef}
                        type="text"
                        value={inlineText}
                        onChange={handleInlineInputChange}
                        onKeyDown={(e) => handleInlineKeyDown(e, index)}
                        onBlur={() => commitInlineEdit(index)}
                        className="outline-none border-b border-gray-400 min-w-[40px] max-w-[120px]"
                        autoFocus
                      />
                    ) : (
                      <span
                        ref={(el) => (itemsRef.current[index] = el)}
                        className="formula-item text-blue-600 font-medium cursor-text"
                        onDoubleClick={(e) => handleTextDoubleClick(index, item.value.toString(), e)}
                      >
                        {item.value}
                      </span>
                    ))}
                </React.Fragment>
              )
            })}

            
            <div
              className="w-1 h-4 cursor-text"
              onClick={(e) => handlePositionClick(items.length, e)}
              style={{
                backgroundColor: activeIndex === items.length ? "#9333ea" : "transparent",
                width: "2px",
                marginRight: "2px",
              }}
            />

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowSuggestions(true)
                if (activeIndex === null) {
                  setActiveIndex(items.length)
                }
              }}
              className="flex-1 outline-none min-w-[100px]"
              placeholder={items.length === 0 ? "Start typing..." : ""}
            />
          </div>
        </div>

       
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {isLoading ? (
              <div className="px-4 py-2 text-gray-500">Loading suggestions...</div>
            ) : error ? (
              <div className="px-4 py-2 text-red-500">Error loading suggestions</div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-2 text-gray-500">No suggestions found</div>
            ) : (
              suggestions.map((suggestion) => {
                const color = getTagColor(suggestion.category)
                return (
                  <div
                    key={suggestion.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    {renderIcon(suggestion.category)}
                    <span className={color}>{suggestion.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({suggestion.category})</span>
                    {suggestion.value && (
                      <span className="ml-auto text-xs text-gray-500">Value: {suggestion.value}</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      
      {result !== null && (
        <div className="mt-4 p-2 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            Result: <span className="font-medium">{result}</span>
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-2">Instructions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Type to search for variables (fetched from API)</li>
          <li>Type numbers directly to add them to the formula</li>
          <li>Use operators (+, -, *, /, ^, (, )) between tags and numbers</li>
          <li>Press space to convert text to a plain text item</li>
          <li>Press backspace to delete the last item</li>
          <li>Click anywhere in the formula to position your cursor</li>
          <li>Double-click on text or numbers to edit them inline</li>
          <li>Use left/right arrow keys to navigate between items</li>
          <li>Click the dropdown on each tag to see options</li>
        </ul>
      </div>
    </div>
  )
}
