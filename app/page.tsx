'use client';

import { ChatInterface } from '@/components/ChatInterface';

import { useChat } from "ai/react";
import { useEffect } from 'react';


export default function Home() {

  const { messages, input, handleSubmit, handleInputChange, isLoading, append } =
    useChat({
      onError: () =>
        console.error("You've been rate limited, please try again later!"),
    });


  useEffect(() => {

    console.log("messages from home", messages)
  }, [messages]);

  return <ChatInterface />;
}
