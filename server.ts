/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  const BASE_PATH = process.env.BASE_PATH || '';

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize Gemini client lazily to avoid crashing on startup if the key is missing
  let aiClient: GoogleGenAI | null = null;
  function getAiClient() {
    if (!aiClient) {
      const apiKey = process.env.AI_API_KEY;
      if (!apiKey) {
        console.warn('Warning: GEMINI_API_KEY environment variable is not set. Real-time AI interpretation will fall back to local mock analyses.');
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'qkyd-mobile/1.0',
          },
        },
      });
    }
    return aiClient;
  }

  // API endpoint for Gemini interpretation
  app.post('/api/gemini/interpret', async (req, res) => {
    try {
      const { name, role, room, heartRate, oxygen, temp, steps } = req.body;
      const client = getAiClient();

      if (!client) {
        // Fallback to locally defined mock analytics if API key is missing
        return res.json({
          success: true,
          text: `[本地备用分析] ${name} (${room}) 今日体征：心率 ${heartRate} bpm（正常），血氧饱和度 ${oxygen}%（良好），体温 ${temp}°C（稳定），步数 ${steps}步。整体状态看起来十分稳健。请保持室内空气流通并定时补充水分。`,
        });
      }

      const prompt = `
      长者姓名：${name}
      身份标签：${role}
      所在房间：${room}
      
      今日生理体征数据：
      - 心率: ${heartRate} 次/分 (参考区间：60-100次/分)
      - 血氧饱和度: ${oxygen}% (参考区间：95%-100%)
      - 体温: ${temp}°C (参考区间：36.0°C-37.3°C)
      - 每日步数: ${steps} 步 (目标：5000步)
      
      请基于上述体征，生成今日的健康数据解读。
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: '你是一位资深的养老社区智慧医疗管理AI助手。请针对给出的长者生理数据，生成一段温馨、专业、凝练的“AI健康解读”。字数控制在100字左右。如果数据有异常（例如心率偏高、体温偏高或血氧过低），应警示并给出明确的、可操作的护理建议。如果一切正常，给予温和关怀并鼓励长者保持健康的日常习惯。中文回答。',
          temperature: 0.7,
        },
      });

      const interpretationText = response.text || '暂无解读数据';
      res.json({
        success: true,
        text: interpretationText,
      });
    } catch (error: any) {
      console.error('Gemini API error during interpretation:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'AI 解读请求失败，请稍后重试',
      });
    }
  });

  // Hot module replacement or static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(BASE_PATH, vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(BASE_PATH, express.static(distPath));
    app.get(`${BASE_PATH}*`, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
