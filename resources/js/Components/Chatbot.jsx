import { useEffect, useRef, useState } from 'react';
import '../../css/chatbot.css';

export default function Chatbot() {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const inputRef = useRef();

  const siteContext = {
    name: "Storie Vault",
    description: "Storie Vault is an interactive storytelling platform where users can read, extend, and publish creative stories. It blends community-driven writing with professional publishing opportunities.",
    about: "Storie Vault is a collaborative storytelling platform that empowers readers to become writers. Users can explore admin-published stories, continue them by writing their own chapters, and share their creations with the community. The platform also offers a paid publishing feature for users to request official distribution of their stories on external platforms. With genre-based filtering, character selection, and community interaction, Storie Vault redefines how stories evolve through collective creativity.",
    faq: [
        {
          q: "What does 'Where stories begin — and grow' mean?",
          a: "It reflects Storie Vault's vision to be more than just a writing platform. It's a living, evolving space where writers of all levels can explore, express, and grow creatively."
        },
        {
          q: "Is Storie Vault a finished platform?",
          a: "No, Storie Vault is constantly evolving. New features, tools, and opportunities are being developed to enhance the experience for writers and readers alike."
        },
        {
          q: "Who is Storie Vault built for?",
          a: "Storie Vault is for everyone — from first-time storytellers to experienced writers. It's a space designed to support all levels of creative expression."
        },
        {
          q: "What inspired the creation of Storie Vault?",
          a: "The platform was born from a mind full of imagination and storytelling passion — built for people who have ideas racing through their heads but need the right place to shape them into stories."
        },
        {
          q: "How does AI fit into Storie Vault?",
          a: "AI in Storie Vault acts as a creative assistant. It doesn't write for you but supports you by offering grammar help, idea shaping, and inspiration when you're stuck."
        },
        {
          q: "Is AI required to write on Storie Vault?",
          a: "Not at all. You don't have to use AI if you prefer writing independently. It's there as a tool — completely optional, never mandatory."
        },
        {
          q: "Can AI replace my creativity?",
          a: "No, and it shouldn't. AI is used to support your creativity — not replace it. Your voice, your thoughts, and your storie remain at the center."
        },
        {
          q: "Why offer AI tools if stories are meant to be human?",
          a: "Because even creative minds need a little help sometimes — whether it's to overcome writer's block, fix grammar, or spark new ideas. AI is just there to gently guide your creativity, not take over."
        },
        {
          q: "What's the philosophy behind AI on Storie Vault?",
          a: "Storie Vault believes great stories come from real people. AI is simply a supporting tool — like a notepad, a thesaurus, or a friend offering ideas. You stay in control."
        },
        {
          q: "What makes Storie Vault different from other platforms?",
          a: "It's not static or fixed. Storie Vault is a creative journey that evolves with its writers. It grows with your input, adapts to your needs, and values your voice above all."
        }
      ]
      
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #robot-chatbox .chat-message, 
      #userInput {
        text-transform: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
  const getContextMessage = (userMessage) => {
    return `Context: Site Name: ${siteContext.name}
Description: ${siteContext.description}
About: ${siteContext.about}

Important branding rule: Always spell the brand as "Storie Vault" (not "Story Vault"). Prefer "storie" instead of "story" when referring to the brand or platform name.

User: ${userMessage}`;
  };

  const appendMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const sendMessage = async () => {
    const message = inputRef.current.value.trim();
    
    if (!message) return;

    appendMessage('You', message);
    inputRef.current.value = '';

    try {
      const contextMessage = getContextMessage(message);
      const res = await fetch('/chatgpt/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ message: contextMessage })
      });
      const data = await res.json();
      appendMessage('Assistant', data.response || 'No response');
    } catch {
      appendMessage('Assistant', 'Error contacting AI');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <div className="robot-chat-bot-button" onClick={() => setVisible(true)}>
        <img className="robot-chat-bot-img" src="../../../assets/images/robot-chat-bot.gif" alt="Chat Bot" />
      </div>
      {visible && (
        <div id="robot-chatbot">
          <div className="robot-chatbot-head">
            <div className="robot-name">AI Robot Assistant</div>
            <span className="robot-chatbox-close" onClick={() => setVisible(false)}>-</span>
          </div>
          <div id="robot-chatbox">
            {messages.map((m, i) => (
              <div key={i} className="chat-message">
                <strong>{m.sender}: </strong>{m.text}
              </div>
            ))}
          </div>
          <div className="robot-message-area">
            <input ref={inputRef} type="text" id="userInput" placeholder="Ask me anything..." onKeyDown={handleKeyDown} />
            <button className="robot-msg-send-button" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
