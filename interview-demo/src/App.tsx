import { useEffect, useRef, useState } from 'react';
import { Button, Input, List, Select, message as antdMessage } from 'antd';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import OpenAI from 'openai';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  reasoning_content?: string;
};

const { TextArea } = Input;
const models = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat v3' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Chat r1' }
];

export default function App() {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chat-messages');
    return saved ? JSON.parse(saved) : [];
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);
      // const userMessage = { id: Date.now().toString(), content: input, role: 'user' as const };
      // const assistantMessage = { id: (Date.now() + 1).toString(), content: '', role: 'assistant' as const };
      // const newMessages = [...messages, userMessage, assistantMessage];
      // setMessages(newMessages);

      // const assistantMessageId = assistantMessage.id;

      // await fetchEventSource('/api/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${import.meta.env.VITE_AI_KEY}`
      //   },
      //   body: JSON.stringify({ message: input, model: selectedModel }),
      //   onopen: async () => {
      //     setInput('');
      //   },
      //   onmessage: (event) => {
      //     if (event.data === '[DONE]') return;
      //     const chunk = event.data;
      //     setMessages(prev => {
      //       const newMessages = prev.map(msg =>
      //         msg.id === assistantMessageId
      //           ? { ...msg, content: msg.content + chunk }
      //           : msg
      //       );
      //       localStorage.setItem('chat-messages', JSON.stringify(newMessages));
      //       return newMessages;
      //     });
      //   },
      //   onclose: () => {
      //     setLoading(false);
      //   },
      //   onerror: (err) => {
      //     antdMessage.error('请求失败: ' + err.message);
      //     setLoading(false);
      //   }
      // });
      console.log(input, 'input');

      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'API_KEY',
        dangerouslyAllowBrowser: true
      });

      const userMessage = { id: Date.now().toString(), content: input, role: 'user' as const };
      const assistantMessage = { id: (Date.now() + 1).toString(), content: '', role: 'assistant' as const };
      const newMessages = [...messages, userMessage, assistantMessage];
      setMessages(newMessages);
      setInput('');

      const stream = await openai.chat.completions.create({
        messages: [...messages.map(msg => ({ role: msg.role, content: msg.content })), { role: "user", content: input }],
        model: selectedModel,
        stream: true
      });

      let content = '';
      let resasoningContent = '';
      for await (const chunk of stream) {
        content += chunk.choices[0]?.delta?.content || '';
        resasoningContent += chunk.choices[0]?.delta?.reasoning_content || '';
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content, reasoning_content: resasoningContent }
              : msg
          );
          localStorage.setItem('chat-messages', JSON.stringify(updated));
          return updated;
        });
      }
      setLoading(false);


    } catch (err) {
      console.log(err);
      antdMessage.error('发送消息失败');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 h-screen mt20">
      <List
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item className={msg.role === 'user' ? 'justify-end' : 'justify-start'}>
            <div className="flex flex-col gap-2">
              <div className='border border-gray-100 bg-gray-25'>
                {msg.role === 'assistant' && msg.reasoning_content && (
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">{msg.reasoning_content}</div>
                  </div>
                )}
              </div>

              <div className={`p-6 rounded-xl text-base ${msg.role === 'user'
                ? 'bg-blue-100 ml-auto'
                : 'bg-gray-100 mr-auto'}`}>
                {msg.content || <span className="text-gray-400">思考中...</span>}
              </div>

            </div>
          </List.Item>
        )}
        className="flex-1 overflow-auto mb-6 space-y-4"
      />
      <div ref={messagesEndRef} />

      <div className="flex flex-col gap-4">
        <Select
          value={selectedModel}
          onChange={setSelectedModel}
          options={models}
          className="w-48"
        />
        <div className="flex gap-4">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            placeholder="输入消息..."
            disabled={loading}
            className="text-base"
          />
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={!loading && <span>发送</span>}
            className="h-auto px-8"
          />
        </div>
      </div>
      );
    </div>
  );
}
