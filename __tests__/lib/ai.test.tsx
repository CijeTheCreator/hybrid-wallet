import { AI } from '@/lib/ai';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Mocked response'
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
  streamUI: jest.fn().mockResolvedValue({
    value: <div>Mocked UI</div>
  })
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

describe('Function Calling Integration', () => {
  it('should handle send_cryptocurrency function calls', async () => {
    const mockStreamUI = require('ai/rsc').streamUI;
    
    // Test that streamUI is called with correct tools configuration
    await AI.actions.submitUserMessage('Send 10 ETH to alice');
    
    expect(mockStreamUI).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          send_cryptocurrency: expect.objectContaining({
            description: 'Process a cryptocurrency sending request',
            parameters: expect.objectContaining({
              type: 'object',
              properties: expect.objectContaining({
                amount: expect.any(Object),
                currency: expect.any(Object),
                recipient: expect.any(Object)
              })
            })
          })
        })
      })
    );
  });

  it('should handle general_response function calls', async () => {
    const mockStreamUI = require('ai/rsc').streamUI;
    
    await AI.actions.submitUserMessage('What is my balance?');
    
    expect(mockStreamUI).toHaveBeenCalledWith(
      expect.objectContaining({
        tools: expect.objectContaining({
          general_response: expect.objectContaining({
            description: 'Provide a general response for non-transaction queries'
          })
        })
      })
    );
  });
});