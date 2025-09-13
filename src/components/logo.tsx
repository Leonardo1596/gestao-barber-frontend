import { Scissors } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Scissors className="h-8 w-8 text-accent" />
      <h1 className="text-2xl font-bold text-primary font-headline">Gestão Barber</h1>
    </div>
  );
}
