import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

function App() {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [transcript, setTranscript] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:3000/extract-transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl, videoTitle })
        });

        const data = await response.json();
        setTranscript(data.transcript);
    };

    const downloadPdf = async () => {
        const pdfDoc = await PDFDocument.create();
        const pageWidth = 600;
        const pageHeight = 800;
        const margin = 50;
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        const textWidth = pageWidth - 2 * margin;
        const textHeight = pageHeight - 2 * margin;

        const lines = transcript.split('\n');
        let page = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const text = line.split(' ').reduce((acc, word) => {
                if (acc.length === 0 || acc[acc.length - 1].length + word.length + 1 <= textWidth / fontSize) {
                    if (acc.length === 0) acc.push(word);
                    else acc[acc.length - 1] += ` ${word}`;
                } else {
                    acc.push(word);
                }
                return acc;
            }, []);

            for (let j = 0; j < text.length; j++) {
                y -= lineHeight;
                if (y < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    y = pageHeight - margin - lineHeight;
                }
                page.drawText(text[j], {
                    x: margin,
                    y,
                    size: fontSize,
                    color: rgb(0, 0, 0),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transcript.pdf';
        a.click();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <h1 className="text-2xl font-bold mb-4">Transcript Extractor</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="videoUrl" className="block text-gray-700">Video URL:</label>
                    <input
                        type="text"
                        id="videoUrl"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="videoTitle" className="block text-gray-700">Video Title:</label>
                    <input
                        type="text"
                        id="videoTitle"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                    Extract Transcript
                </button>
            </form>
            {transcript && (
                <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-xl font-bold mb-2">Transcript</h2>
                    <pre className="whitespace-pre-wrap text-gray-700">{transcript}</pre>
                    <button
                        onClick={downloadPdf}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 mt-4"
                    >
                        Download as PDF
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;
