import { timeout } from '~tools';


export class Telegram {
    botToken: string;
    chatId: string;
    port: chrome.runtime.Port;

    messages: Map<string, Object> = new Map<string, Object>();

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

    isEnabled(){
        return this.botToken && this.chatId
    };

    async sendQuestion(question: Object, aiAnswer: Object|null) {
        if (!this.isEnabled()) {
            return
        }

        const [text, inlineKeyboards] = this.buildMessageData(question, aiAnswer)

        if (this.messages.has(question["id"])) {
            const tgMsg = this.messages.get(question["id"]);

            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/editMessageText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    message_id: tgMsg['message_id'],
                    text,
                    parse_mode: 'MarkdownV2',
                    reply_markup: {
                        inline_keyboard: [inlineKeyboards],
                    }
                })
            });
        } else {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
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
            });

            const data = await response.json();
            if (data?.result) {
                this.messages.set(question["id"], data?.result);
            }

        }
    };

    buildMessageData(question: Object, aiAnswer: Object|null): Array<any> {
        let img = '';
        if (question['img']) {
            img = `[${question['img']['alt'] || 'Image'}](${question['img']['src']})\n`
        }

        let text = `Question: \n\`\`\`\n${question["text"]}\n\`\`\`\n${img}Options:\n\`\`\`\n`;
        let inlineKeyboards = [];

        for (var i = 0; i < question["items"].length; i++) {
            const option = question["items"][i];
            const checked = option['checked'];
            let AIChecked = option['AIChecked'];

            if (aiAnswer) {
                AIChecked = aiAnswer && aiAnswer['id'] ? aiAnswer['id'] === option['id'] : false;
            }

            let checkEmoji = [];

            if (AIChecked) {
                checkEmoji.push("🤖")
            }

            if (checked) {
                checkEmoji.push("✔️")
            }

            text += `${(i + 1)}. ${option['text']}    ${checkEmoji.join(' ')}\n`;

            inlineKeyboards.push({
                'text': `${(i + 1)}. ${option['text']}`,
                'callback_data': this.callbackQueryData(question['id'], option['id'])
            });
        }
        text += '\n`\`\`';

        return [text, inlineKeyboards]
    }

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

        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${(lastUpdateId + 1)}&timeout=15&allowed_updates=["callback_query"]`);
            const data = await response.json();
    
            const updates = data.result;
            if (updates && updates.length > 0) {
                // Process updates
                for (let update of updates) {
                    // Here you can handle the update, for example, print the text of a message
                    if (update.callback_query) {
                        await this.processPullUpdate(update.callback_query);
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

    async processPullUpdate(callbackQuery: any) {
        const [_, questionId, optionId] = callbackQuery.data.split(":");

        if (!this.messages.has(questionId)) {
            const message = callbackQuery.message;

            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/editMessageText`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: message.chat.id,
                    message_id: message.message_id,
                    text: message.text,
                    // parse_mode: 'MarkdownV2',
                    // reply_markup: {
                    //     inline_keyboard: [inlineKeyboards],
                    // }
                })
            });
        }

        // send to content
        this.port.postMessage({ chack: true, data: {
            'qId': questionId,
            'oId': optionId,
        }});

        await this.answerCallbackQuery(callbackQuery.id);
    };
};