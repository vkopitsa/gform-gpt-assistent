import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"

function OptionsIndex() {
  const [checked, setOpenaiKey] = useStorage<string>("openaiKey", "")

  return (
    <div>
      <h1>
        Welcome to GForm GPT Assistent Extension!
      </h1>
      <h2>OpenAI API key</h2>
      <input onChange={(e) => setOpenaiKey(e.target.value)} value={checked} />
    </div>
  )
}

export default OptionsIndex