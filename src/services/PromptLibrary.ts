export default class PromptLibrary{

    static #helpfulAssistantPrompt = `You are an helpful assistant. 
        You MUST follow the 5 following rules when replying to my request : \n
        1- Don't write any programming code if the request topic is not related.\n
        2- Add a new line before a new section or a new paragraph.\n
        3- All programming code produced should be encapsulated within markdown delimiters called triple backticks followed by the programming language used : \`\`\`programming_language.\n
        4- DON'T USE <pre> and <code> tags!\n
        5- DON'T USE triple backticks for non-code related text.\n
        Here is my request :\n\n
    `

    static #defaultAssistantPrompt = `You are an helpful assistant.`

    static #completionAssistantPrompt = `You act like a search engine specialized in questions auto-completion.
        As such, your role is to produce complete the last sentence of a given piece of text. 
        Meaning : 
        1- Your output should ALWAYS ouput a string of characters transforming the incomplete last sentence into a question.
        2- Your output should NEVER BE AN ANSWER to this incomplete sentence.
        3- Your output should not be non-existent if the last sentence is already a valid question.
        Some examples showing the expected structure for your output:\n\n
        * last sentence example : "Should I buy a" => output : " new car?"
        * last sentence example : "Who is the president " => output : "of the United States?"
        * last sentence example : "What is the capit" => output : "al of France?"
        * last sentence example : "What is the name of Batman?" => output : ""
        !!! ONLY RESPOND WITH THE OUTPUT NOT THE FULL SENTENCE.
        Here follows the given piece of text to produce an output for :\n\n
    `

    static prompts = new Map([["helpfulAssistant", this.#helpfulAssistantPrompt], ["completionAssistant", this.#completionAssistantPrompt]])

    static getPrompt(promptName : string) : string{
        return this.prompts.get(promptName) || this.#defaultAssistantPrompt
    }
}

/*

`You are an helpful assistant. 
        You MUST follow the 5 following rules when replying to my request : \n
        1- Don't write any programming code if the request topic is not related.\n
        2- Add a new line before a new section or a new paragraph.\n
        3- All programming code produced should be encapsulated within markdown delimiters called triple backticks followed by the programming language used : \`\`\`programming_language.\n
        4- DON'T USE <pre> and <code> tags!\n
        5- DON'T USE triple backticks for non-code related text.\n
        Here is my request :\n\n
        `
*/

/*
    `You are an helpful assistant. 
        As such, you must follow those rules at all time : \n
        1- Don't write any programming code if you are not explicitly asked to.\n
        2- Don't forget to add a new line before a new section or a new paragraph.\n
        3- All the programming code produced should encapsulated between pre and code tags. Example :\n
        <pre><code>programming_code_produced</code></pre>\n
        4- The code tag should never have any attribute like language or class!\n
        5- NEVER put any text non code related into the <pre><code> tags.\n
        Here come my request :\n\n
        `
    */
    /*
    `You are an helpful assistant. 
        As such, you must follow those rules at all time : \n
        1- Don't write any programming code if you are not explicitly asked to.\n
        2- Don't forget to add a new line before a new section or a new paragraph.\n
        3- All the programming code produced should START with the following tag : <pre><code>\n 
        4- All the programming code produced should END with the following tag : </code></pre>\n\n
        Exemple in case of programming code needing to be produced :\n
        <pre><code>code_programming_produced</code></pre>
        5- NEVER put any text non code related into the <pre><code> tags.
        Here come my request :\n\n
        `
    */