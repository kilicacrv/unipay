import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method Not Allowed' });
  }

  try {
    const { imageUrl, name, university } = req.body;

    if (!imageUrl || !name || !university) {
      return res.status(400).json({ valid: false, error: 'Eksik bilgi (Resim, Ad, Üniversite zorunludur).' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // If API key is missing, fallback gracefully or return error
      return res.status(500).json({ valid: false, error: 'Sunucu hatası: Yapay zeka yapılandırması eksik.' });
    }

    // Download the image from the public URL and convert to Base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Resim indirilemedi');
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    
    // Determine mime type from URL or default to jpeg
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `
      Sen katı ve profesyonel bir belge onaylama asistanısın. Sana bir öğrenci kartı fotoğrafı (veya öğrenci belgesi) gönderiliyor.
      Görev: Bu belgenin bir öğrenciye ait olup olmadığını ve verilen isim/üniversite bilgileriyle eşleşip eşleşmediğini kontrol et.

      Kullanıcının beyan ettiği bilgiler:
      - İsim Soyisim: ${name}
      - Üniversite: ${university === 'selcuk' ? 'Selçuk Üniversitesi' : university === 'necmettin' ? 'Necmettin Erbakan Üniversitesi' : university === 'ktn' ? 'KTO Karatay Üniversitesi' : university}

      Kurallar:
      1. Belgede yukarıdaki ismin geçip geçmediğini kontrol et (küçük harf hatalarını, Türkçe karakterleri veya ekstra göbek adlarını tolere edebilirsin, önemli olan büyük ölçüde eşleşmesidir).
      2. Belgede beyan edilen üniversitenin adının geçip geçmediğini kontrol et.
      3. Belgenin gerçekten bir öğrenci kimliği veya resmi bir öğrenci belgesi formunda görünüp görünmediğine bak.

      Cevabını SADECE AŞAĞIDAKİ GİBİ GEÇERLİ BİR JSON FORMATINDA DÖNDÜR. Başka hiçbir açıklama yazma:
      {
        "valid": true veya false,
        "reason": "Eğer valid true ise boş bırakabilirsin. False ise, kullanıcıya gösterilecek kısa, kibar ve Türkçe bir hata mesajı yaz (örn: 'İsim eşleşmedi' veya 'Üniversite adı okunamadı')."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    const resultJson = JSON.parse(resultText);

    return res.status(200).json(resultJson);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ valid: false, error: 'Sistem hatası: ' + error.message });
  }
}
