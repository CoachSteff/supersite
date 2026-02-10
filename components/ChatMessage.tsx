import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { ChatMessage as ChatMessageType } from './ChatProvider';
import styles from '@/styles/Chat.module.css';
import 'highlight.js/styles/github-dark.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.messageContent}>
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              code: ({node, inline, className, children, ...props}: any) => (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      <div className={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
        {!isUser && (
          <button
            onClick={handleCopy}
            className={styles.copyButton}
            aria-label="Copy message"
            title="Copy markdown"
          >
            {showCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
