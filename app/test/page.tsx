'use client';

import { LaTeXMathMLRenderer } from '@/components/LaTeXMathMLRenderer';

export default function TestPage() {
  // Using template literals with String.raw to handle backslashes
  const inlineExample = String.raw`Here's an inline equation: $E = mc^2$ and another one: \( \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \)`;
  
  const displayExample = String.raw`\[
    \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
  \]`;
  
  const matrixExample = String.raw`\[
    \begin{bmatrix}
      a & b \\
      c & d
    \end{bmatrix}
    \begin{bmatrix}
      x \\
      y
    \end{bmatrix} =
    \begin{bmatrix}
      ax + by \\
      cx + dy
    \end{bmatrix}
  \]`;
  
  const directExample = String.raw`This is a test of the LaTeXMathMLRenderer component. Here's an equation: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$`;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">LaTeX Math Rendering Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">1. Inline Math</h2>
          <LaTeXMathMLRenderer content={inlineExample} className="text-lg" />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">2. Display Math</h2>
          <LaTeXMathMLRenderer content={displayExample} className="text-lg" />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">3. Matrix Example</h2>
          <LaTeXMathMLRenderer content={matrixExample} className="text-lg" />
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">4. Direct Usage</h2>
          <LaTeXMathMLRenderer content={directExample} className="text-lg" />
          
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
            <h3 className="font-medium mb-2">Code:</h3>
            <pre className="bg-gray-200 dark:bg-gray-700 p-3 rounded overflow-x-auto text-sm">
{`<LaTeXMathMLRenderer 
  content="This is a test. Here's an equation: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$" 
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
