export class Assistent {
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

    async getAnswer(msg: string, callback) {
        const question = JSON.parse(msg);
        const messages = this.getMessages(question);
        const functions = this.getFunctions(question);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'model': this.model,
                'temperature': 0.2,
                'function_call': functions[0],
                messages,
                functions,
            })
        })

        const data = await response.json();
        await callback(this.getAnswerFromRespose(data, question));        
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
                const answer = question["items"].find(a => a["text"] === function_args.answer)
                return {
                    answer: function_args.answer,
                    option: answer,
                }
            }
        }

        return null
    }
}