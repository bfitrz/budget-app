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
  Divider,
} from '@mui/material';
import {
  FileUpload as UploadIcon,
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  FileDownload as DownloadIcon,
} from '@mui/icons-material';
import { useBudgetStore } from '@/store';
import { importExcelFile, exportToExcel } from '@/utils';

export function ImportView() {
  const theme = useTheme();
  const isDataLoaded = useBudgetStore((s) => s.isDataLoaded);
  const importData = useBudgetStore((s) => s.importData);
  const resetAndImport = useBudgetStore((s) => s.resetAndImport);

  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
        result.pozostale.length;

      if (totalItems === 0) {
        setMessage({
          type: 'error',
          text: 'Nie znaleziono danych w pliku. Upewnij się, że arkusze mają nazwy: MebleImport, WykończenieImport, AGDImport, PozostałeImport.',
        });
      } else {
        if (isDataLoaded) {
          resetAndImport(result);
        } else {
          importData(result);
        }

        setMessage({
          type: 'success',
          text: `Zaimportowano: Meble (${result.meble.length}), Wykończenie (${result.wykonczenie.length}), AGD (${result.agd.length}), Pozostałe (${result.pozostale.length})`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Błąd importu: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
      });
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
        <Typography variant="h4">Import danych</Typography>
        <Typography variant="body2" color="text.secondary">
          Zaimportuj dane z pliku Excel (.xlsx) lub przeciągnij plik
        </Typography>
      </Box>

      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ p: 4 }}>
          {isDataLoaded && (
            <Alert
              severity="info"
              icon={<CheckIcon />}
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
              Wymagane arkusze
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {['MebleImport', 'WykończenieImport', 'AGDImport', 'PozostałeImport'].map((name) => (
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
                exportToExcel(state);
              }}
            >
              Pobierz plik .xlsx
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
