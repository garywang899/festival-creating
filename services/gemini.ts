
import { GoogleGenAI, Modality } from "@google/genai";
import { FestivalType, TargetAudience } from "../types.ts";

export class GeminiService {
  private static getAiClient() {
    // 确保 process.env 存在，即使在没有注入的环境中也不崩溃
    const apiKey = (window as any).process?.env?.API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : '') || '';
    return new GoogleGenAI({ apiKey });
  }

  static async generateGreeting(festival: FestivalType, audience: TargetAudience, keywords: string): Promise<string> {
    const ai = this.getAiClient();
    
    const prompt = `你是一名专业的企业行政公关专家。请为${festival}生成一段给${audience}的祝福语。
    
    核心要求：
    1. 【必须包含称呼】：祝福语开头必须有针对“${audience}”的正式或亲切称呼。
    2. 【身份契合】：内容必须精准针对“${audience}”这一群体。
    3. 【风格匹配】：
       - 商业伙伴/政府部门：庄重、得体、专业。
       - 同事/客户：大气、振奋、真诚。
       - 家人/朋友：温馨、活泼、亲切。
    4. 关键词建议：${keywords || '温馨、大气、专业'}。
    
    请直接输出祝福语正文，不要包含任何多余的开头语或解释。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "生成失败，请重试。";
  }

  static async generateImage(promptText: string, festival: FestivalType): Promise<string> {
    const ai = this.getAiClient();
    const visualPrompt = `A high-quality greeting card design for ${festival}. 
    The theme should be elegant and festive. 
    Context: ${promptText}. 
    No text in the image, just artistic background, symbolic elements of the festival. 
    Professional corporate aesthetic. 16:9 aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: visualPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Image generation failed");
  }

  static async generateAudio(text: string, festival: FestivalType, audience: TargetAudience): Promise<string> {
    const ai = this.getAiClient();
    
    let voiceName = 'Kore';
    let styleDescription = '大气、诚挚、节奏平缓';

    if (audience === TargetAudience.FAMILY || audience === TargetAudience.FRIENDS) {
      voiceName = 'Puck';
      styleDescription = '温馨、亲切、充满喜悦';
    } else if (audience === TargetAudience.GOVERNMENT) {
      voiceName = 'Charon';
      styleDescription = '庄重、得体、富有磁性';
    }

    const ttsPrompt = `请用${styleDescription}的语气朗读以下${festival}祝福语：\n${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: ttsPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed");

    return await this.createWavBlobUrl(base64Audio);
  }

  private static async createWavBlobUrl(base64Pcm: string): Promise<string> {
    const bytes = this.decode(base64Pcm);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await this.decodeAudioData(bytes, audioContext, 24000, 1);
    const wavBlob = this.audioBufferToWav(audioBuffer);
    return URL.createObjectURL(wavBlob);
  }

  private static decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private static async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  private static audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const sampleRate = buffer.sampleRate;

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, buffer.length * 2, true);

    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  static async generateVideo(promptText: string, festival: FestivalType, imageUrl?: string): Promise<string> {
    const ai = this.getAiClient();
    const videoPrompt = `A 15-second elegant greeting video for ${festival}. Cinematic animation. ${promptText}. Professional corporate aesthetic.`;
    const config: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: videoPrompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    };
    if (imageUrl) {
      config.image = { imageBytes: imageUrl.split(',')[1], mimeType: 'image/png' };
    }
    let operation = await ai.models.generateVideos(config);
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${(window as any).process?.env?.API_KEY || ''}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
}
