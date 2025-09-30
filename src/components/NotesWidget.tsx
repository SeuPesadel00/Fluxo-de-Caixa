import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StickyNote, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export const NotesWidget = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const { toast } = useToast();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('fluxo-caixa-notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes to localStorage whenever notes changes
  useEffect(() => {
    localStorage.setItem('fluxo-caixa-notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = () => {
    if (!currentContent.trim()) {
      toast({
        title: 'Erro',
        description: 'A nota não pode estar vazia.',
        variant: 'destructive',
      });
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: currentTitle.trim() || 'Sem título',
      content: currentContent.trim(),
      createdAt: new Date().toISOString(),
    };

    setNotes(prev => [newNote, ...prev]);
    setCurrentTitle('');
    setCurrentContent('');
    
    toast({
      title: 'Nota salva',
      description: 'Sua nota foi salva com sucesso.',
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    toast({
      title: 'Nota removida',
      description: 'A nota foi excluída.',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Bloco de Notas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="Título da nota (opcional)"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
          />
          <Textarea
            placeholder="Digite sua anotação aqui..."
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <Button onClick={handleSaveNote} className="w-full">
            Salvar Nota
          </Button>
        </div>

        {notes.length > 0 && (
          <div className="space-y-3 mt-6">
            <h3 className="font-semibold text-sm">Notas Salvas</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {notes.map((note) => (
                <Card key={note.id} className="p-3 bg-muted/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(note.createdAt)}
                      </p>
                      <p className="text-sm mt-2 whitespace-pre-wrap">{note.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
