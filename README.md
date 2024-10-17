- NOT FUNCTIONAL YET -

# OSSPITA : Run your local AI assistant to experience enhanced privacy and zero cost.

OSSPITA is a lightweight, fully local, open-source AI-powered research and conversational interface that enables users to interact in real time with various Open-Source models. Leveraging the Ollama API, OSSPITA provides a seamless experience for engaging with cutting-edge AI technology.

## I - Features

- **Real-time interactions** with most Open-Source AI models.
- Lightweight and **fully local** operations.
- **User-friendly** conversational UI.
- R.A.G. so you can feed the LLM your own documents while **preserving your privacy**.
- Web Search functionality for the integration of **up-to-date informations**.

## II - Coming Soon

- **Agents chaining** to tackle complex tasks.
- Prompt versioning.
- **Dark mode** theme.
- Advanced Models settings : Top-K, Repeat, Mirostat, etc..
- **Responsive** design.
- Improved Web Search algorithm.
- Improved RAG algorithm.
- Graph generation.
- **Multimodal** operations.

## III - Screenshots

![osspita main](https://github.com/ask0ldd/OsspitaUI/blob/main/src/assets/screenshot1.png "osspita main")

## IV - Technologies Used

- React 18.3.1
- Vite
- Marked 14.1.1
- Ollama API
- ExpressJS
- LokiJS
- Duck-duck-scrape
- Cherio

## V - Getting Started

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
| 8GB        | Llama 3.1:8b     | Conversational | [Llama 3.1 on Ollama](https://ollama.ai/library/llama2)              |
| 12GB       | Mistral Nemo:12b | Conversational | [Mistal Nemo on Ollama](https://ollama.ai/library/mistral)           |
| 4GB        | starcoder2:3b    | Coding         | [StarCoder2 on Ollama](https://ollama.com/library/starcoder2)        |
| 8GB & 12GB | qwen2.5-coder:7b | Coding         | [Qwen 2.5 Coder on Ollama](https://ollama.com/library/qwen2.5-coder) |

### Installation

Clone the repository :

> git clone https://github.com/ask0ldd/OsspitaUI.git

Navigate to the project directory:

> cd OsspitaUI

#### Backend

> cd back

Install dependencies:

> npm install

Start the development server:

> ./run

#### Frontend

> cd front

Install dependencies:

> npm install

Start the development server:

> npm run dev

Open your browser and visit http://localhost:5173 to use the application.

## VI - Usage

## VII - Contributing

I'm not looking of any contributor until the v1.0.0 release. Thanks a lot for your support.

## VIII - Acknowledgments

- Georgi Gerganov and all related contributors for llama.cpp.
- The Ollama team for providing the inference API.
- React and Vite communities for their excellent tools.
- All contributors and supporters of the project.
- All the people producing GGUF models.
