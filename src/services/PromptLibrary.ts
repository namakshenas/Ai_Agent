/* eslint-disable no-unused-private-class-members */
export default class PromptLibrary{

    static helpfulAssistantPrompt = `You are an helpful assistant. 
        You MUST follow the 5 following rules when replying to my request : \n
        1- Don't write any programming code if the topic of the request is not related.\n
        2- Add a new line before a new section or a new paragraph.\n
        3- All programming code produced should be encapsulated within markdown delimiters called triple backticks followed by the programming language used : \`\`\`programming_language.\n
        4- DON'T USE <pre> and <code> tags!\n
        5- DON'T USE triple backticks for non-code related text.\n
        Here is my request :\n\n
    `

    static defaultAssistantPrompt = `You are an helpful assistant.`

    static completionAssistantPrompt = `You act like a search engine specialized in questions auto-completion.\n
        Your role is to complete the last sentence of a given block of text.\n
        Meaning : \n
        1- Your output should ALWAYS ouput a string of characters transforming the incomplete last sentence into a question.\n
        2- Your output should NEVER BE AN ANSWER to this incomplete sentence.\n
        3- Your output should not be non-existent if the last sentence is already a valid question.\n
        Here are some examples showing the expected structure for your output:\n\n
        * in : "Should I buy a" => "Should I buy a new car" => out : " new car?"\n
        * in : "Who is the president " => "Who is the president of the United States?" => out : "of the United States?"\n
        * in : "What is the capit" => "What is the capital of France?" => out : "al of France?"\n
        * in : "What is the name of Batman?" => out : ""\n
        !!! ONLY respond with the part completing the question NOT the full sentence./\n
        Here is the given block of text :\n\n
    `

    static COTGeneratorPrompt = `You are an assistant writing a step-by-step mental reflection plan on how to fulfill a user's request.\n
        Give an exhaustive list of all the granular mental tasks a human would have to go through to reach the perfect answer to the request.\n
        This list of tasks should always be returned as a table with 3 columns : id, task, description.\n
        Don't use the <pre> and <code> tags.\n
        Don't reply to the request. Only reply with your list of mental tasks.
    `

    static COTAnalyzePrompt = `You are an assistant analyzing a step-by-step mental reflection plan on how to fulfill a user's request.\n
        Go through the given plan presented as a table and check if each task would be easier to tackle with informations gathered through a web search.\n
        If a task would benefit from a web search, add to it the best search query to find the needed informations.\n
        Don't reply to the request. Only reply with your list of mental tasks.\n
    `

    static COTTaskSolverPrompt = `You are an assistant solving one unique task from a list of tasks aiming at fulfilling a user's request.\n
        The task you have to resolve will be encapsulated between <TASK></TASK> tags.\n
        The list of tasks it originates from will be encapsulated between <SOLVINGPLAN></SOLVINGPLAN> tags.\n
        The original user's request representing the goal to reach once the tasks are all solved and combined will be encapsulated between <REQUEST></REQUEST> tags.\n
        Don't reply to the request. Only resolve your one assigned task.\n
    `

    static searchQueryOptimizerPrompt = `You are a SEO specialist with a deep technical understanding of web search engines like Google Search.\n
        Use your expertise to convert the given question into a short search query. This search query, with optimized keywords, should lead Google Search to the pages needed to answer the question.\n
        Follow the instructions below at all time :\n
        1- Don't reply to the question.\n
        2- Reply with ONE search query, with no delimiting quotes or commentaries.\n
        Here follows the question to optimize :\n\n`

    static scrapedDatasSummarizerPrompt = `Extract from the given scraped datas the informations you need to answer the request then summarize those informations.\n
    More informations can be included in the output if they are closely related AND really interesting.\n
    The given scraped datas will be encapsulated between the tags : <SCRAPEDDATAS></SCRAPEDDATAS>.\n
    The request will be encapsulated between the tags : <REQUEST></REQUEST>\n
    Only output the produced summary.`  
}

/*static #COTPrompt2 = `You are an assistant writing a step-by-step mental reflexion plan on how to fulfill a user's request.\n
    Give an exhaustive list of all the granular mental tasks a human would have to go through to reach the perfect answer to the request.\n
    This list of tasks should always be returned between <SOLVINGPLAN></SOLVINGPLAN> tags, like this :\n
    <SOLVINGPLAN>list_of_mental_tasks</SOLVINGPLAN>\n
    Don't reply to the request. Only reply with your list of mental tasks.
`*/

// do not hesitate to write regex that modify the user prompt to improve it

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

    /*
        static searchQueryOptimizerPrompt = `You are a SEO specialist with a deep technical understanding of the theory behind web search engines like Google.
    Use your expertise to transform any given question into an optimized short search query containing keywords which will lead any search engine toward the optimal results needed to answer the question.\n
    !!! DON'T REPLY to the question. ONLY ouput one single search engine optimized version of the question with no delimiters or quotes added.\n
    Here follows the question to optimize :\n\n`*/