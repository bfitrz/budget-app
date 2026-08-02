import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  alpha,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  FileUpload as UploadIcon,
  CloudUpload as CloudIcon,
  FileDownload as DownloadIcon,
  Description as TemplateIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '@/store';
import { useNotesStore } from '@/store/notesStore';
import { importExcelFile, exportToExcel, exportTemplate } from '@/utils';

export function ImportView() {
  const theme = useTheme();
  const isDataLoaded = useBudgetStore((s) => s.isDataLoaded);
  const importData = useBudgetStore((s) => s.importData);
  const resetAndImport = useBudgetStore((s) => s.resetAndImport);

  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; type: 'success' | 'error'; text: string }>({ open: false, type: 'success', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessage({ type: 'error', text: 'Wybierz plik Excel (.xlsx)' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await importExcelFile(file);

      const totalItems =
        result.meble.length +
        result.wykonczenie.length +
        result.agd.length +
        result.pozostale.length +
        result.wyprowadzka.length +
        result.saldo.length +
        result.harmonogram.length +
        result.milestones.length;

      if (totalItems === 0) {
        setMessage({
          type: 'error',
          text: 'Nie znaleziono danych w pliku. Upewnij się, że arkusze mają nazwy: Meble, Wykończenie, AGD, Pozostałe, Wyprowadzka, Saldo, Harmonogram, Milestones, Notatki.',
        });
      } else {
        if (isDataLoaded) {
          resetAndImport(result);
        } else {
          importData(result);
        }

        // Import notes if present
        if (result.notes.length > 0) {
          const notesStore = useNotesStore.getState();
          // Replace notes
          for (const note of result.notes) {
            notesStore.addNote();
            const addedNote = notesStore.notes[notesStore.notes.length - 1];
            notesStore.updateNote(addedNote.id, { text: note.text, color: note.color, done: note.done });
          }
        }

        const parts: string[] = [];
        if (result.meble.length > 0) parts.push(`Zakupy (${result.meble.length})`);
        if (result.wykonczenie.length > 0) parts.push(`Wykończenie (${result.wykonczenie.length})`);
        if (result.agd.length > 0) parts.push(`AGD (${result.agd.length})`);
        if (result.pozostale.length > 0) parts.push(`Inne (${result.pozostale.length})`);
        if (result.wyprowadzka.length > 0) parts.push(`Wyprowadzka (${result.wyprowadzka.length})`);
        if (result.saldo.length > 0) parts.push(`Saldo (${result.saldo.length})`);
        if (result.harmonogram.length > 0) parts.push(`Harmonogram (${result.harmonogram.length})`);
        if (result.milestones.length > 0) parts.push(`Milestones (${result.milestones.length})`);
        if (result.notes.length > 0) parts.push(`Notatki (${result.notes.length})`);

        setMessage({
          type: 'success',
          text: `Zaimportowano: ${parts.join(', ')}`,
        });
        const total = totalItems + result.notes.length;
        setSnackbar({ open: true, type: 'success', text: 'Import zakończony — ' + total + ' pozycji załadowanych' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Błąd importu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
      });
      setSnackbar({ open: true, type: 'error', text: 'Import nie powiódł się' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Import / Eksport</Typography>
        <Typography variant="body2" color="text.secondary">
          Zarządzaj danymi — importuj z pliku Excel lub wyeksportuj aktualny stan
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ p: 4 }}>
          {isDataLoaded && (
            <Alert
              severity="info"
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Dane zostały już załadowane. Ponowny import zastąpi obecne dane.
            </Alert>
          )}

          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
              borderRadius: 3,
              p: 5,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isDragOver
                ? alpha(theme.palette.primary.main, 0.04)
                : 'transparent',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
              },
            }}
          >
            {loading ? (
              <CircularProgress size={48} />
            ) : (
              <>
                <CloudIcon
                  sx={{
                    fontSize: 56,
                    color: isDragOver ? theme.palette.primary.main : theme.palette.text.secondary,
                    opacity: isDragOver ? 1 : 0.5,
                    mb: 2,
                    transition: 'all 0.2s ease',
                  }}
                />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Przeciągnij plik tutaj
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  lub kliknij, aby wybrać plik z dysku
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Wybierz plik .xlsx
                </Button>
              </>
            )}
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          {message && (
            <Alert
              severity={message.type}
              sx={{ mt: 3, borderRadius: 2 }}
            >
              {message.text}
            </Alert>
          )}

          <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Obsługiwane arkusze
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {['Meble', 'Wykończenie', 'AGD', 'Pozostałe', 'Wyprowadzka', 'Saldo', 'Harmonogram', 'Milestones', 'Notatki'].map((name) => (
                <Typography
                  key={name}
                  variant="body2"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}
                >
                  {name}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Template section */}
      <Card sx={{ maxWidth: 640, mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Szablon</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pobierz pusty plik Excel ze wszystkimi zakładkami i nagłówkami — gotowy do wypełnienia danymi.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<TemplateIcon />}
            onClick={() => {
              exportTemplate();
              setSnackbar({ open: true, type: 'success', text: 'Szablon pobrany' });
            }}
          >
            Pobierz szablon .xlsx
          </Button>
        </CardContent>
      </Card>

      {/* Export section */}
      {isDataLoaded && (
        <Card sx={{ maxWidth: 640, mt: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Eksport danych</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Wyeksportuj aktualne dane do pliku Excel (.xlsx) w formacie kompatybilnym z importem.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                const state = useBudgetStore.getState();
                const notes = useNotesStore.getState().notes;
                exportToExcel(state, notes);
                setSnackbar({ open: true, type: 'success', text: 'Eksport zakończony — plik został pobrany' });
              }}
            >
              Pobierz plik .xlsx
            </Button>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.type}
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 500 }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </Box>
  );
}
