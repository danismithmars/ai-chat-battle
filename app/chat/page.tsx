"use client";

import { useState, ChangeEvent, MouseEvent } from "react";
import styles from "./ChatComponent.module.css"; // Adjust path as necessary
import OpenAI from "openai";

interface ConversationMessage {
  sender: string;
  message: string;
}

const ChatComponent: React.FC = () => {
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInitialPrompt(e.target.value);
    setIsButtonDisabled(!e.target.value.trim());
  };

  const handleStartButtonClick = async (e: MouseEvent<HTMLButtonElement>) => {
    const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, dangerouslyAllowBrowser: true });

    setIsLoading(true);

    const initialMessage: ConversationMessage = { sender: "User", message: initialPrompt };
    setConversation((prevConversation) => [...prevConversation, initialMessage]);

    const conversationHistory = [
      { role: "user", content: initialPrompt } as const // Type assertion to ensure the type is correct
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4", 
        messages: conversationHistory, 
      });

      const aiResponse = completion.choices[0].message.content;

      const aiMessage: ConversationMessage = { sender: "AI", message: aiResponse || '' };
      setConversation((prevConversation) => [...prevConversation, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response", error);
    }

    setIsLoading(false);
    setInitialPrompt("");
    setIsButtonDisabled(true);
  };


  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>AI Chat Battle</h1>
      <div className={styles.conversationContainer}>
        <div className={styles.conversationMessages}>
          {conversation.length === 0 ? (
            <div className={styles.noConversation}>
              <div className={styles.icon}>💬</div>
              <h3 className={styles.promptText}>Enter a prompt to start</h3>
              <p className={styles.promptDescription}>
                The AI will respond based on your initial prompt.
              </p>
            </div>
          ) : (
            conversation.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageContainer} ${msg.sender === "User" ? styles.userMessage : styles.botMessage}`}
              >
                <div
                  className={`${styles.avatar} ${msg.sender === "User" ? styles.userAvatar : styles.botAvatar}`}
                >
                  <span className={styles.avatarIcon}>🤖</span>
                </div>
                <div
                  className={`${msg.sender === "User" ? styles.userBubble : styles.botBubble} ${styles.messageBubble}`}
                >
                  <div className={styles.sender}>{msg.sender}</div>
                  <p className={styles.message}>{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className={styles.inputSection}>
        <label htmlFor="initialPrompt" className={styles.label}>
          Enter initial prompt for AI conversation:
        </label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="initialPrompt"
            placeholder="What should the AI talk about?"
            className={styles.inputField}
            value={initialPrompt}
            onChange={handleInputChange}
          />
          <button
            id="startButton"
            className={`${styles.startButton} ${isButtonDisabled ? styles.disabledButton : ""}`}
            disabled={isButtonDisabled}
            onClick={handleStartButtonClick}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
