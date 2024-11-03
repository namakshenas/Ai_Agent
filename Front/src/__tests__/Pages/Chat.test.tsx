import { MemoryRouter } from 'react-router-dom';
import '@testing-library/react/dont-cleanup-after-each'
import Chat from '../../pages/Chat';
import { OllamaService } from '../../services/OllamaService';
import AgentService from '../../services/API/AgentService';
import { render, screen, waitFor } from '@testing-library/react';
import {describe, beforeEach, vi, expect, test } from 'vitest';
import '@testing-library/react/dont-cleanup-after-each'
import mockModelsList from '../../__mocks__/mockModelsList';
import mockAgentsList from '../../__mocks__/mockAgentsList';
import DocService from '../../services/API/DocService';
import mockRAGDocumentsList from '../../__mocks__/mockRAGDocumentsList';
import PromptService from '../../services/API/PromptService';
import mockPromptsList from '../../__mocks__/mockPromptsList';

const MockedRouter = () => (
    <MemoryRouter>
      <Chat />
    </MemoryRouter>
);

const mockVoices = [
    { name: 'Voice 1', lang: 'en-US' },
    { name: 'Voice 2', lang: 'es-ES' },
];

describe('Given I am on the Chat page', () => {
    beforeEach(() => {
        vi.spyOn(OllamaService, 'getModelList').mockResolvedValue(mockModelsList);
        vi.spyOn(AgentService, 'getAll').mockResolvedValue(mockAgentsList);
        vi.spyOn(DocService, 'getAll').mockResolvedValue(mockRAGDocumentsList);
        vi.spyOn(PromptService, 'getAll').mockResolvedValue(mockPromptsList);
        vi.stubGlobal('speechSynthesis', {
            getVoices: vi.fn().mockReturnValue(mockVoices),
        });
        render(<MockedRouter />)
    });

    test('Then I should see the page title', async () => {
        await waitFor(() => expect(screen.getByText(/OSSPITA FOR/i)).toBeInTheDocument());
        expect(screen.getByText(mockPromptsList[0].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[1].name)).toBeInTheDocument()
        expect(screen.getByText(mockPromptsList[2].name)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[0].filename)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[1].filename)).toBeInTheDocument()
        expect(screen.getByText(mockRAGDocumentsList[2].filename)).toBeInTheDocument()
    })
})