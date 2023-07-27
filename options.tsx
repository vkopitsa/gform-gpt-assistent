import { useStorage } from "@plasmohq/storage/hook"


export const models = ["gpt-3.5-turbo-0613", "gpt-4-0613"]

export const NONE_EVENT = "none";
export const CHOOSE_EVENT = "choose";
export const OPACITY_EVENT = "opacity";
export const RED_BACKGROUND_EVENT = "red-background";

export const events = [CHOOSE_EVENT, OPACITY_EVENT, RED_BACKGROUND_EVENT, NONE_EVENT]

function OptionsIndex() {
  const [event, setEvent] = useStorage<string>("event", events[0])
  const [openaiKey, setOpenaiKey] = useStorage<string>("openaiKey", "")
  const [openaiModel, setOpenaiModel] = useStorage<string>("openaiModel", models[0])
  const [tgBotToken, setTgBotToken] = useStorage<string>("tgBotToken", "")
  const [tgChatId, setTgChatId] = useStorage<string>("tgChatId", "")

  const autoSetTgChatId = () => {
      fetch(`https://api.telegram.org/bot${tgBotToken}/getUpdates?allowed_updates=["message"]&timeout=60`)
      .then((response) => response.json())
      .then((data) => {
        const updates = data.result;
        if (updates.length > 0 && updates[0]?.message?.chat?.id) {
          setTgChatId(updates[0]?.message?.chat?.id);
        }
      })
  };

  
  return (
    <div>
      <h1>
        Welcome to Google Form GPT Assistent!
      </h1>

      <h2>Settings:</h2>

      <h3>Event on answer</h3>
      <select value={event} onChange={e => setEvent(e.target.value)}>
        {events.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <br/>
      <br/>
      
      <h2>OpenAI settings:</h2>
   
      <h3>API key</h3>
      <input
        style={{ width: "400px" }}
        onChange={(e) => setOpenaiKey(e.target.value)}
        value={openaiKey}
      />

      <br/>

      <h3>Model</h3>
      <select value={openaiModel} onChange={e => setOpenaiModel(e.target.value)}>
        {models.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <br/>
      <br/>

      <h2>Telegram settings:</h2>
      
      <h3>Token</h3>
      <input
        style={{ width: "400px" }}
        onChange={(e) => setTgBotToken(e.target.value)}
        value={tgBotToken}
      />

      <br/>
      
      <h3>Chat ID</h3>
      <input
        style={{ width: "100px" }}
        onChange={(e) => setTgChatId(e.target.value)}
        value={tgChatId}
      />

      {!tgChatId && (
        <span onClick={autoSetTgChatId}>
          To automatically set up the Chat ID, please click here. In case you are using a group chat, mention the bot. If you are using a private chat, just send any text message.
        </span>
      )}
    </div>
  )
}

export default OptionsIndex