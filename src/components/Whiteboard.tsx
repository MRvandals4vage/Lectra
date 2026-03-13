import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Eraser, Pencil, Square, Circle, Download, Trash2, Undo, MousePointer2, Type } from 'lucide-react';
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
  const [color, setColor] = useState('#4F46E5');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rect' | 'circle' | 'text'>('pencil');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        const context = canvas.getContext('2d');
        if (context) {
          context.scale(2, 2);
          context.lineCap = 'round';
          context.lineJoin = 'round';
          context.strokeStyle = color;
          context.lineWidth = brushSize;
          contextRef.current = context;
          
          if (initialData && Array.isArray(initialData)) {
            initialData.forEach((stroke: any) => drawStroke(stroke));
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
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

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

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

    socket.emit('whiteboard-update', { 
      roomId, 
      type: 'draw', 
      tool, 
      color, 
      size: brushSize, 
      points: [{x: offsetX, y: offsetY}] 
    });
  };

  const stopDrawing = async () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5002'}/classroom-extras/whiteboard`, {
          meetingId: roomId,
          data: canvas.toDataURL()
        });
      } catch (err) {
        console.error('Failed to save whiteboard:', err);
      }
    }
  };

  const clearCanvasLocal = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }
  };

  const handleClear = () => {
    if (window.confirm('Erase entire neural grid?')) {
      clearCanvasLocal();
      socket.emit('whiteboard-update', { roomId, type: 'clear' });
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `lectra-board-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-lectra-sidebar rounded-[2.5rem] overflow-hidden border border-lectra-border/50 shadow-2xl relative">
      {/* Top Controls Float */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-lectra-card/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'pencil', icon: Pencil, label: 'Sketch' },
          { id: 'eraser', icon: Eraser, label: 'Erase' },
          { id: 'rect', icon: Square, label: 'Vector' },
          { id: 'circle', icon: Circle, label: 'Orbit' },
          { id: 'text', icon: Type, label: 'Data' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id as any)}
            className={cn(
              "p-3 rounded-2xl transition-all relative group",
              tool === t.id ? "bg-lectra-primary text-white shadow-lg shadow-lectra-primary/30" : "text-lectra-muted hover:text-white hover:bg-white/5"
            )}
            title={t.label}
          >
            <t.icon className="size-4.5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-lectra-background text-[8px] font-black uppercase tracking-widest text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {t.label}
            </span>
          </button>
        ))}
        
        <div className="w-[1px] h-8 bg-white/5 mx-2" />
        
        <div className="flex items-center gap-3 pr-3">
          <div className="relative group p-1">
             <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="size-8 rounded-xl border-none bg-transparent cursor-pointer relative z-10"
            />
            <div className="absolute inset-0 rounded-xl border-2 border-white/10 group-hover:border-lectra-primary/50 transition-all" />
          </div>
        </div>
      </div>

      {/* Side Actions Float */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-1.5 bg-lectra-card/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] shadow-xl">
        <button onClick={handleClear} className="p-3 text-lectra-muted hover:text-lectra-danger hover:bg-lectra-danger/10 rounded-2xl transition-all group">
          <Trash2 className="size-4.5" />
        </button>
        <button onClick={downloadCanvas} className="p-3 text-lectra-muted hover:text-lectra-success hover:bg-lectra-success/10 rounded-2xl transition-all group">
          <Download className="size-4.5" />
        </button>
      </div>

      {/* Canvas Hub */}
      <div className="flex-1 relative bg-lectra-background cursor-crosshair overflow-hidden group/canvas">
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
        
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="block relative z-10"
        />
        
        {/* Status Indicators */}
        <div className="absolute bottom-6 left-8 flex items-center gap-4 z-20 pointer-events-none">
           <div className="flex items-center gap-2 bg-lectra-background/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
             <div className="size-1.5 rounded-full bg-lectra-primary shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lectra-muted">Sync Grid Enabled</span>
           </div>
        </div>
      </div>

      {/* Bottom Parameter Adjuster */}
      <div className="absolute bottom-6 right-8 flex items-center gap-6 p-4 bg-lectra-card/80 backdrop-blur-2xl border border-white/10 rounded-[1.75rem] shadow-xl z-50">
        <div className="flex flex-col gap-2 w-32">
          <div className="flex justify-between items-center pr-1">
            <span className="text-[9px] font-black uppercase text-lectra-muted tracking-widest">Width</span>
            <span className="text-[10px] font-black text-lectra-primary">{brushSize}px</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full accent-lectra-primary h-1 bg-white/5 rounded-lg appearance-none cursor-pointer hover:bg-white/10 transition-colors"
          />
        </div>
        <div className="size-8 rounded-xl border border-white/10 flex items-center justify-center bg-lectra-background">
          <div className="rounded-full shadow-inner" style={{ backgroundColor: color, width: Math.min(brushSize, 24), height: Math.min(brushSize, 24) }} />
        </div>
      </div>
    </div>
  );
}
