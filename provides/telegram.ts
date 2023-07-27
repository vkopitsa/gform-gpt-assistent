export class Telegram {
    botToken: string
    chatId: string
    tabId: any

    constructor(botToken: string, chatId: string) {
        this.botToken = botToken;
        this.chatId = chatId;
    };

    setBotToken(botToken: string) {
        this.botToken = botToken;
    };

    setChatId(chatId: string) {
        this.chatId = chatId;
    };

    setTabId(tabId: any) {
        this.tabId = tabId;
    };

    isEnabled(){
        return this.botToken && this.chatId
    };

    async getAnswer(msg: string, callback) {
        const question = JSON.parse(msg);

        // const data = await response.json();
        // await callback(this.getAnswerFromRespose(data, question)); 
    };

    async sendQuestion(msg: string, aiAnswer: Object|null) {
        const question = JSON.parse(msg);

        if (!this.isEnabled()) {
            return
        }

        let img = '';
        if (question['img']) {
            img = `[${question['img']['alt'] || 'Image'}](${question['img']['src']})\n`
        }

        let text = `Question: \n\`\`\`\n${question["text"]}\n\`\`\`\n${img}Options:\n\`\`\`\n`;
        let inlineKeyboards = [];

        for (var i = 0; i < question["items"].length; i++) {
            const isChooseByAI = aiAnswer && aiAnswer['option'] ? aiAnswer['option']?.['id'] === question["items"][i]['id'] : false;
            let checkEmoji = isChooseByAI ? "🤖 ✔️" : "";

            text += `${(i + 1)}. ${question["items"][i]['text']}    ${checkEmoji}\n`;

            inlineKeyboards.push({
                'text': `${(i + 1)}. ${question["items"][i]['text']}`,
                'callback_data': this.callbackQueryData(question['id'], question["items"][i]['id'])
            });
        }
        text += '\n`\`\`';

        return fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: this.chatId,
                text,
                parse_mode: 'MarkdownV2',
                reply_markup: {
                    inline_keyboard: [inlineKeyboards],
                }
            })
        })
    };

    async answerCallbackQuery(callbackQueryId: string, text: string = 'Processed') {
        if (!this.isEnabled()) {
            return
        }

        return fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text,
            })
        })
    };

    callbackQueryData(questionId, optionId) {
        return `answer:${questionId}:${optionId}`;
    };

    async pollUpdates(lastUpdateId = 0) {
        if (!this.isEnabled()) {
            await timeout(10000);
            await this.pollUpdates();

            return
        }

        console.log("fsdgdfg");

        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${(lastUpdateId + 1)}&timeout=60&allowed_updates=["callback_query"]`);
            const data = await response.json();
    
            const updates = data.result;
            if (updates && updates.length > 0) {
                // Process updates
                for (let update of updates) {
                    // Here you can handle the update, for example, print the text of a message
                    if (update.callback_query) {
                        const params = update.callback_query.data.split(":");

                        // send to content
                        chrome.tabs.sendMessage(this.tabId, {
                            'qId': params[1],
                            'oId': params[2],
                        })

                        this.answerCallbackQuery(update.callback_query.id);
                    }
                }
    
                // Update the ID of the last update processed
                lastUpdateId = updates[updates.length - 1].update_id;
            }
    
            // Poll for more updates
            await this.pollUpdates(lastUpdateId);
        } catch (error) {
            console.error('Error: ', error);
            
            // Restart poll updates
            await timeout(5000);
            await this.pollUpdates();
        }
    };
}

function timeout(ms?: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}