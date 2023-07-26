# Google Form GPT Assistant

## Description

This is a Chrome extension that assists with Google Forms by using OpenAI's GPT-3 or GPT-4 model to determine the correct answers to questions. The extension is built using the Plasmo framework.

## Installation

To install the extension, you need to have Node.js and npm installed on your system. If you do not have these, you can download and install them from [the official Node.js website](https://nodejs.org).

Once you have Node.js and npm installed, you can install the extension by cloning the repository and running `npm install`:

    git clone https://github.com/your-repo/gform-gpt-assistant.git
    cd gform-gpt-assistant
    npm install

## Development

To start the development server, run:

    npm run dev

## Building

To build the extension for production, run:

    npm run build

or

    npm run build -- --zip

This will create a `dist` directory with the built extension.

## Usage

Once the extension is installed, you can configure it by clicking on the extension icon and selecting "Options". Here, you can enter your OpenAI API key and select the GPT model to use.

When viewing a Google Form, you can click on a question to have the extension predict the correct answer. The extension will choose the correct answer.

## License

This extension is licensed under the MIT license. See the `LICENSE` file for more information.
