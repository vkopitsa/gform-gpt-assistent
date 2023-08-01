import { models } from "options";

export class OpenAI {
    apiKey: string
    model: string

    constructor(apiKey: string, model: string) {
        this.apiKey = apiKey;
        this.model = model;
    }

    setApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    setModel(model: string) {
        this.model = model;
    }

    async getAnswer(question: Object, callback): Promise<Object|null> {
        // const question = JSON.parse(msg);
        const messages = this.getMessages(question);
        const functions = this.getFunctions(question);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'model': this.model || models[0],
                'temperature': 0.2,
                'function_call': functions[0],
                messages,
                functions,
            })
        })

        const data = await response.json();
        const answer = this.getAnswerFromRespose(data, question);
        await callback(answer);

        return answer
    }

    getMessages(question: Object) {
        var prompt = `Question: ${question["text"]} \nOptions:\n`;
        for (var i = 0; i < question["items"].length; i++) {
            prompt += (i + 1) + '. ' + question["items"][i]['text'] + '\n';
        }
        prompt += 'Correct option (or indicate if none are correct):';

        return [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ];
    }

    getFunctions(question: Object) {
        let enums: Array<string> = [];

        for (var i = 0; i < question["items"].length; i++) {
            enums.push(question["items"][i]['text']);
        }

        enums.push("not any");

        return [{
            'name': 'choose_answer',
            'description': '',
            'parameters': {
                "type": "object",
                "properties": {
                    "answer": {
                        "type": "string",
                        "description": "The correct answer to the question",
                        "enum": enums
                    },
                },
                "required": ["answer"],
            }
        }];
    }

    getAnswerFromRespose(response: Object, question: Object): Object|null {
        const response_message = response["choices"][0]["message"];
        if (response_message.function_call) {
            const function_name = response_message["function_call"]["name"]
            const function_args = JSON.parse(response_message["function_call"]["arguments"])

            if (function_args.answer && function_name == "choose_answer") {
                const answer: Object|null = question["items"].find((a: Object) => a["text"] === function_args.answer)
                return {
                    ...(answer ? answer : {}),
                    answer: function_args.answer,
                    AIChecked: true,
                }
            }
        }

        return null
    }
}