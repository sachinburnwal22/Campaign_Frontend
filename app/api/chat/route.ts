import { UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages }: { messages: any[] } = await req.json()
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1] as any
    let userText = '';
    if (lastMessage) {
      if (typeof lastMessage.content === 'string' && lastMessage.content.trim()) {
        userText = lastMessage.content;
      } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        userText = lastMessage.parts
          ?.filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('') || '';
      } else if ((lastMessage as any).text) {
        userText = (lastMessage as any).text;
      }
    }

    let aiResponseText = '';

    try {
      // Call Laravel backend copilot endpoint
      const backendBaseUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${backendBaseUrl}/api/copilot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userText }),
      })

      if (response.ok) {
        const rawData = await response.json();
        // Support both wrapped (data.data) and unwrapped formats
        const data = rawData.data || rawData;
        if (data.success && data.campaign) {
          const c = data.campaign;
          
          aiResponseText = `## 🤖 AI Campaign Proposal: ${c.name}

**🎯 Audience Insights:**
- **Segment Name**: ${c.audienceType}
- **Matching Customers**: ${c.audience.toLocaleString()} customers (fetched from DB)
- **Target Channel**: ${c.channels.join(', ')}

**💬 Message Draft:**
\`\`\`text
${c.message}
\`\`\`

**📈 Projected Metrics:**
- **Conversion Rate**: ${(c.conversionRate * 100).toFixed(1)}%
- **Expected Revenue**: ₹${c.revenue.toLocaleString('en-IN')}
- **Engagement Impact**: Open Rate: ${(c.openRate * 100).toFixed(0)}%, CTR: ${(c.ctrRate * 100).toFixed(0)}%

**⚙️ Rules Compiled:**
${c.segmentRules.map((rule: string) => `- \`${rule}\``).join('\n')}

---
**What next?**
You can head to the **Campaign Builder** tab, select the newly generated **${c.audienceType}** segment, and launch this campaign!`;
        }
      }
    } catch (apiErr) {
      console.error('Error hitting Laravel backend:', apiErr)
    }

    // Fallback if Laravel backend call failed
    if (!aiResponseText) {
      aiResponseText = `## ⚠️ Connection Error

I tried to reach the Laravel backend to analyze this campaign request, but the server appears to be unreachable. 

Please verify that the Laravel backend development server is running locally (e.g. via \`php artisan serve\` on port 8000).`;
    }

    // Return a standard raw text stream compatible with all versions of @ai-sdk/react's useChat
    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < aiResponseText.length; i++) {
          controller.enqueue(encoder.encode(aiResponseText[i]))
          await new Promise(resolve => setTimeout(resolve, 2))
        }
        controller.close()
      }
    })

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
