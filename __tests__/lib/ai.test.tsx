import { AI } from '@/lib/ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            intent: 'send',
            amount: 10,
            currency: 'ETH',
            recipient: 'alice',
            confidence: 0.9
          })
        }
      })
    })
  }))
}));

// Mock ai/rsc
jest.mock('ai/rsc', () => ({
  createAI: jest.fn().mockImplementation((config) => config),
  getMutableAIState: jest.fn().mockReturnValue({
    get: () => ({ chatId: 'test', messages: [] }),
    update: jest.fn(),
    done: jest.fn()
  }),
  streamUI: jest.fn()
}));

describe('AI Configuration', () => {
  it('exports AI instance with correct structure', () => {
    expect(AI).toBeDefined();
    expect(AI.actions).toBeDefined();
    expect(AI.actions.submitUserMessage).toBeDefined();
    expect(AI.actions.confirmTransaction).toBeDefined();
  });

  it('has correct initial states', () => {
    expect(AI.initialUIState).toEqual([]);
    expect(AI.initialAIState).toEqual({ chatId: 'new', messages: [] });
  });
});