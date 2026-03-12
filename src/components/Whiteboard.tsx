import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Pencil, Square, Circle, Download, Trash2, Undo } from 'lucide-react';
import { cn } from '../lib/utils';

interface WhiteboardProps {
  socket: any;
  roomId: string;
  initialData?: any;
}

export default function Whiteboard({ socket, roomId, initialData }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rect' | 'circle'>('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    if (initialData && Array.isArray(initialData)) {
       // Draw initial data if available
       initialData.forEach((stroke: any) => drawStroke(stroke));
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: any) => {
      if (data.type === 'clear') {
        clearCanvasLocal();
      } else {
        drawStroke(data);
      }
    };

    socket.on('whiteboard-update', handleUpdate);
    return () => socket.off('whiteboard-update', handleUpdate);
  }, [socket]);

  const drawStroke = (stroke: any) => {
    const context = contextRef.current;
    if (!context) return;

    context.beginPath();
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.size;
    
    if (stroke.tool === 'pencil') {
        context.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((p: any) => context.lineTo(p.x, p.y));
        context.stroke();
    } else if (stroke.tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
        context.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.forEach((p: any) => context.lineTo(p.x, p.y));
        context.stroke();
        context.globalCompositeOperation = 'source-over';
    }
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = contextRef.current;
    if (!context) return;

    if (tool === 'pencil') {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineTo(offsetX, offsetY);
      context.stroke();
      context.globalCompositeOperation = 'source-over';
    }

    // In a real app, you'd buffer these and emit stroke chunks
    // For simplicity, we emit individual points (though inefficient)
    // socket.emit('whiteboard-update', { roomId, type: 'draw', tool, color, size: brushSize, points: [{x, y}] });
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    
    // Save state to DB
    // saveStateToBackend();
  };

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleClear = () => {
    clearCanvasLocal();
    socket.emit('whiteboard-update', { roomId, type: 'clear' });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-800/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {[
            { id: 'pencil', icon: Pencil, label: 'Pencil' },
            { id: 'eraser', icon: Eraser, label: 'Eraser' },
            { id: 'rect', icon: Square, label: 'Rectangle' },
            { id: 'circle', icon: Circle, label: 'Circle' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as any)}
              className={cn(
                "p-2 rounded-xl transition-all",
                tool === t.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-white/5"
              )}
            >
              <t.icon className="size-4" />
            </button>
          ))}
          <div className="w-[1px] h-6 bg-white/10 mx-2" />
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
            <Trash2 className="size-4" />
          </button>
          <button onClick={downloadCanvas} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
            <Download className="size-4" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair block"
        />
      </div>

      {/* Brush Settings Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800/90 backdrop-blur-2xl rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
            <span>Size</span>
            <span>{brushSize}px</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full accent-primary h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="size-6 rounded-full border border-white/10" style={{ backgroundColor: color, width: brushSize, height: brushSize }} />
      </div>
    </div>
  );
}
