import { Instagram } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <Instagram className="w-16 h-16 mb-4 animate-pulse" />
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '30%' }} />
      </div>
    </div>
  );
}
