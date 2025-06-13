import { createWorker, recognize } from 'tesseract.js';

export const processImage = async (image: any) => {
    try {
        // Sử dụng Tesseract.js để OCR
        const worker = await createWorker('eng');

        // Cấu hình Tesseract cho biển số xe
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-.',
            tessedit_pageseg_mode: '8'
        });

        const { data } = await worker.recognize(image);
        await worker.terminate();

        // Xử lý kết quả
        return processOCRResults(data);
    } catch (error) {
        console.error('OCR Error:', error);
        return null;
    }
};

export const processOCRResults = (ocrData: any) => {
    const results: any[] = [];

    // Xử lý từng word được nhận dạng
    if (ocrData.words) {
        ocrData.words.forEach((word: any) => {
            if (word.confidence > 30 && word.text.length >= 4) {
                // Làm sạch text (loại bỏ ký tự không mong muốn)
                const cleanText = word.text.replace(/[^0-9A-Z\-\.]/g, '').trim();

                if (cleanText.length >= 4) {
                    results.push({
                        text: cleanText,
                        confidence: Math.round(word.confidence),
                        bbox: word.bbox
                    });
                }
            }
        });
    }

    // Sắp xếp theo độ tin cậy
    return results.sort((a, b) => b.confidence - a.confidence);
};

export async function detectPlateFromImage(image: File | Blob): Promise<string[]> {
    const { data: { text } } = await recognize(image, 'eng', {
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    })

    const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
    return lines
}
