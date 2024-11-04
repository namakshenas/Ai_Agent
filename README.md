- NOT FUNCTIONAL YET -

# OSSPITA : Run your local AI assistant to experience enhanced privacy and zero cost.

OSSPITA is a lightweight, fully local, open-source desktop interface that enables users to interact for free and in real time with various Open-Source LLMs. Leveraging the Ollama API, OSSPITA provides a user-friendly experience for engaging with cutting-edge AI technology.

## I - Features

- **Real-time interactions** with most Open-Source AI models.
- Lightweight and **fully local** operations.
- **Beginner-friendly** installation process.
- Retrieval Augmented Generation so you can probe your own documents while **preserving your privacy**.
- Web Search functionality for the integration of more **up-to-date informations**.
- Comprehensive inference stats.
- Memory allocation tracking for **context length tuning**.
- **Prompt library** with (versioning coming).
- Easy access to most **LLM common settings**.

## II - Coming Next

- Persistent conversations.
- **Multimodal** operations.
- **Responsive** design.
- **Agent chaining** for complex task resolution.
- Improved Web Search algorithm with enhanced options.
- Online domain names ranking.
- Improved RAG algorithm with enhanced options (chunk size selection).
- Online prompt and agent sharing platform.
- Prompt versioning system.
- Dedicated coding agent.
- Code syntax highlighting.
- A **Dark mode** theme.
- Advanced Models settings : Top-K, Repeat, Mirostat, etc..
- Charts generation.
- Voice mode.
- Context autosizing option.
- In-depth RAG stats & data.
- In-depth Web Search stats & data.

## III - Screenshots

![osspita main](https://github.com/ask0ldd/OsspitaUI/blob/main/Front/src/assets/screenshot1.png "osspita main")

## IV - Getting Started

### Prerequisites

- Node.js (v18.12.1 or higher) : https://nodejs.org/en/
- npm (8.19.2 or higher)
- Ollama (installed and running locally) : https://ollama.com/download
- OSSPITABack running if you want access to the websearch functionality.
- At least one open source model.
- Nvidia CUDA if needed : https://developer.nvidia.com/cuda-downloads

Models Recommandations :

| GPU VRAM   | Model            | Purpose        | Link                                                                 |
| ---------- | ---------------- | -------------- | -------------------------------------------------------------------- |
| 4GB        | Llama 3.2:3b     | Conversational | [Llama 3.2 on Ollama](https://ollama.ai/library/llama2)              |
| 8GB        | Aya Expanse:8b   | Conversational | [Aya Expanse on Ollama](https://ollama.com/library/aya-expanse:8b)   |
| 12GB       | Mistral Nemo:12b | Conversational | [Mistal Nemo on Ollama](https://ollama.ai/library/mistral)           |
| 4GB        | starcoder2:3b    | Coding         | [StarCoder2 on Ollama](https://ollama.com/library/starcoder2)        |
| 8GB & 12GB | qwen2.5-coder:7b | Coding         | [Qwen 2.5 Coder on Ollama](https://ollama.com/library/qwen2.5-coder) |

### Installation

Clone the repository :

> git clone https://github.com/ask0ldd/OsspitaUI.git

Navigate to the project directory:

> cd OsspitaUI

#### Frontend

> cd front

Install dependencies:

> npm install

Start the development server:

> npm run dev

Open your browser and visit http://localhost:5173 so that you can be guided through the rest of the installation process.

## V - Usage

Video demo :

## VI - Technologies Used

- React 18.3.1
- Vite
- Ollama API
- ExpressJS
- LokiJS
- Duck-duck-scrape
- Cheerio
- React-pdftotext
- Marked 14.1.1
- Turndown

## VII - Contributing

If you face any bug or if you want me to add / improve any functionality, open an issue with your request. Thanks a lot for your help.

## VIII - Acknowledgments

- Georgi Gerganov and all associated contributors for llama.cpp.
- The Ollama team for providing the API used for inference.
- React and Vite communities for their excellent tools.
- All contributors and supporters of the project.
- Everybody producing GGUF models.
- And finally, all the people that worked on any of the libraries I used.
