import React from 'react';
import { motion } from 'framer-motion';
import { Share, Copy, MessageCircle, Mail } from 'lucide-react';

interface ShareButtonProps {
  className?: string;
  variant?: 'button' | 'icon';
  url?: string;
  title?: string;
  text?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  className = '', 
  variant = 'button',
  url = window.location.href,
  title = 'VMQ Výroba - Řídicí Centrum',
  text = 'Podívej se na VMQ výrobní dashboard s real-time analýzami!'
}) => {

  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare(shareData)) {
        console.log('[Share] Using Web Share API');
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      console.log('[Share] Web Share API failed or cancelled:', error);
    }

    // Fallback: Show share options
    showShareOptions(shareData);
  };

  const showShareOptions = (shareData: { title: string; text: string; url: string }) => {
    const shareText = `${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`;
    
    // Try to copy to clipboard first
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✅ Odkaz zkopírován do schránky!');
      }).catch(() => {
        showManualShareOptions(shareData);
      });
    } else {
      showManualShareOptions(shareData);
    }
  };

  const showManualShareOptions = (shareData: { title: string; text: string; url: string }) => {
    const shareText = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
    const shareTitle = encodeURIComponent(shareData.title);
    
    const options = [
      {
        name: 'WhatsApp',
        url: `https://wa.me/?text=${shareText}`,
        color: '#25D366'
      },
      {
        name: 'Email',
        url: `mailto:?subject=${shareTitle}&body=${shareText}`,
        color: '#1E40AF'
      },
      {
        name: 'Telegram',
        url: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`,
        color: '#0088cc'
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
        color: '#1877F2'
      },
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${shareText}`,
        color: '#1DA1F2'
      }
    ];

    const optionsHtml = options.map(option => 
      `<a href="${option.url}" target="_blank" style="
        display: inline-block; 
        margin: 5px; 
        padding: 8px 16px; 
        background: ${option.color}; 
        color: white; 
        text-decoration: none; 
        border-radius: 8px;
        font-weight: 500;
      ">${option.name}</a>`
    ).join('');

    const popup = window.open('', 'sharePopup', 'width=500,height=400,scrollbars=yes');
    if (popup) {
      popup.document.write(`
        <html>
          <head>
            <title>Sdílet VMQ Výrobu</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                padding: 20px; 
                text-align: center;
                background: #f8fafc;
              }
              .container {
                background: white;
                padding: 30px;
                border-radius: 16px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              h2 { color: #1f2937; margin-bottom: 20px; }
              .url-box { 
                background: #f1f5f9; 
                padding: 12px; 
                border-radius: 8px; 
                margin: 20px 0;
                font-family: monospace;
                word-break: break-all;
                border: 1px solid #e2e8f0;
              }
              .copy-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                margin-top: 10px;
              }
              .copy-btn:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>🏭 Sdílet VMQ Výrobu</h2>
              <div class="url-box">${shareData.url}</div>
              <button class="copy-btn" onclick="
                navigator.clipboard.writeText('${shareData.url}').then(() => {
                  alert('✅ Odkaz zkopírován!');
                }).catch(() => {
                  prompt('Zkopírujte odkaz:', '${shareData.url}');
                });
              ">📋 Kopírovat odkaz</button>
              <div style="margin-top: 30px;">
                <h3>Nebo sdílet přes:</h3>
                <div style="margin-top: 15px;">
                  ${optionsHtml}
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      popup.document.close();
    } else {
      // Popup blocked, use prompt as final fallback
      prompt('Zkopírujte odkaz pro sdílení:', shareData.url);
    }
  };

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleShare}
        className={`
          p-2 rounded-full bg-white/10 backdrop-blur-md
          hover:bg-white/20 transition-all duration-300
          ${className}
        `}
        title="Sdílet aplikaci"
      >
        <Share className="w-5 h-5 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className={`
        flex items-center gap-2 px-4 py-2 
        bg-white/10 backdrop-blur-md border border-white/20
        text-white rounded-lg font-semibold text-sm
        hover:bg-white/20 hover:border-white/30
        transition-all duration-300 shadow-md
        ${className}
      `}
    >
      <Share className="w-4 h-4" />
      Sdílet
    </motion.button>
  );
};

export default ShareButton;