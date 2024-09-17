/* eslint-disable no-unused-private-class-members */
import { marked } from "marked"

class AnswerFormatingService{

    static async format(answer : string) : Promise<string>{
        return this.#codetransformer(await marked(answer))
    }

    static #codetransformer(text : string) : string {
        return text.replace(/(<pre><code([\s\S]*?)>[\s\S]*?<\/code><\/pre>)/g, (match, codeContent, languageNJunk) => {
            const language = languageNJunk ? this.#capitalizeFirstLetter(languageNJunk.split('-')[1]).replace('"', "") : undefined
            if(language === undefined || language === 'Markdown') 
                return `<div class="textBlock">
                            <div class="body">${codeContent}</div>
                        </div>`
            return `<div class="codeBlock">
                        <div class="title">Code<span style="margin-left:auto; padding-right:0.5rem">${language}</span></div>
                        <div class="body">${codeContent}</div>
                    </div>`})
    }

    static #capitalizeFirstLetter(text : string) : string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

}

export default AnswerFormatingService

// code regex (?:^|\n)(?:\s*(?:[\w.]+\s*(?:\(.*?\))?\s*(?:->|=>)?\s*(?:\{|\:)|\b(?:function|def|class|if|for|while|switch)\b|\#|\$|\/\/|\/\*|\*\/|<\?php|\?>|import\s+[\w.]+|from\s+[\w.]+\s+import))
// static regexRepository = new Map<string, string>().set("incomplete code block", "/<code>.*$/").set("complete code block", "/<code>.*?</code>/")