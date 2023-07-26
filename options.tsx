import { useState, useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"

function OptionsIndex() {
  const [openaiKey, setOpenaiKey] = useStorage<string>("openaiKey", "")
  const [openaiModel, setOpenaiModel] = useStorage<string>("openaiModel", "gpt-3.5-turbo-0613")
  const models = ["gpt-3.5-turbo-0613", "gpt-4-0613"]

  return (
    <div>
      <h1>
        Welcome to Google Form GPT Assistent!
      </h1>

      <br/>

      <h2>OpenAI API key</h2>
      <input
        style={{ width: "400px" }}
        onChange={(e) => setOpenaiKey(e.target.value)}
        value={openaiKey}
      />
      <br/>

      <h2>Model</h2>
      <select value={openaiModel} onChange={e => setOpenaiModel(e.target.value)}>
        {models.map(m => <option value={m}>{m}</option>)}
      </select>
    </div>
  )
}

export default OptionsIndex