import { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  SwapHoriz as AltIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Check as SaveIcon,
} from '@mui/icons-material';
import { AlternativeItem, ItemLink } from '@/types';
import { formatCurrency, generateId } from '@/utils';

interface AlternativesModalProps {
  open: boolean;
  onClose: () => void;
  alternatives: AlternativeItem[];
  onSave: (alternatives: AlternativeItem[]) => void;
  itemName?: string;
  baseCena?: number;
}

export function AlternativesModal({ open, onClose, alternatives, onSave, itemName, baseCena }: AlternativesModalProps) {
  const theme = useTheme();
  const [localAlts, setLocalAlts] = useState<AlternativeItem[]>(alternatives);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formNazwa, setFormNazwa] = useState('');
  const [formCena, setFormCena] = useState<number | string>(0);
  const [formUwagi, setFormUwagi] = useState('');
  const [formLinki, setFormLinki] = useState<ItemLink[]>([]);
  const [newLinkNazwa, setNewLinkNazwa] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleOpen = () => {
    setLocalAlts(alternatives);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormNazwa('');
    setFormCena('');
    setFormUwagi('');
    setFormLinki([]);
    setNewLinkNazwa('');
    setNewLinkUrl('');
  };

  const handleAddAlt = () => {
    if (!formNazwa.trim()) return;
    // Add pending link if URL is filled
    let linki = formLinki;
    if (newLinkUrl.trim()) {
      const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`;
      linki = [...formLinki, { nazwa: newLinkNazwa.trim() || url, url }];
    }
    const newAlt: AlternativeItem = {
      id: generateId(),
      included: true,
      nazwa: formNazwa.trim(),
      cena: Number(formCena) || 0,
      uwagi: formUwagi,
      linki,
    };
    setLocalAlts([...localAlts, newAlt]);
    resetForm();
  };

  const handleStartEdit = (alt: AlternativeItem) => {
    setEditingId(alt.id);
    setFormNazwa(alt.nazwa);
    setFormCena(alt.cena);
    setFormUwagi(alt.uwagi);
    setFormLinki(alt.linki || []);
    setNewLinkNazwa('');
    setNewLinkUrl('');
  };

  const handleSaveEdit = () => {
    if (!editingId || !formNazwa.trim()) return;
    // Add pending link if URL is filled
    let linki = formLinki;
    if (newLinkUrl.trim()) {
      const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`;
      linki = [...formLinki, { nazwa: newLinkNazwa.trim() || url, url }];
    }
    setLocalAlts(localAlts.map((a) =>
      a.id === editingId ? { ...a, nazwa: formNazwa.trim(), cena: Number(formCena) || 0, uwagi: formUwagi, linki } : a
    ));
    resetForm();
  };

  const handleDeleteAlt = (id: string) => {
    setLocalAlts(localAlts.filter((a) => a.id !== id));
    if (editingId === id) resetForm();
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`;
    setFormLinki([...formLinki, { nazwa: newLinkNazwa.trim() || url, url }]);
    setNewLinkNazwa('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setFormLinki(formLinki.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(localAlts);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AltIcon sx={{ fontSize: 20 }} />
          Alternatywy{itemName ? ` — ${itemName}` : ''}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ maxHeight: '70vh' }}>
        {baseCena !== undefined && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
            <Typography variant="caption" color="text.secondary">Cena MAIN</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>{formatCurrency(baseCena)}</Typography>
          </Box>
        )}

        {/* Existing alternatives list */}
        {localAlts.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Istniejące alternatywy ({localAlts.length})
            </Typography>
            {localAlts.map((alt) => (
              <Box
                key={alt.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${editingId === alt.id ? theme.palette.primary.main : theme.palette.divider}`,
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3) },
                }}
              >
                {editingId === alt.id ? (
                  /* Edit mode */
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <TextField size="small" value={formNazwa} onChange={(e) => setFormNazwa(e.target.value)} label="Nazwa" fullWidth autoFocus />
                    <TextField size="small" value={formCena} onChange={(e) => setFormCena(e.target.value)} label="Cena (PLN)" type="number" fullWidth />
                    <TextField size="small" value={formUwagi} onChange={(e) => setFormUwagi(e.target.value)} label="Uwagi" fullWidth />
                    {/* Links */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <LinkIcon sx={{ fontSize: 12 }} /> Linki ({formLinki.length})
                      </Typography>
                      {formLinki.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {formLinki.map((link, i) => (
                            <Chip key={i} label={link.nazwa} size="small" onDelete={() => handleRemoveLink(i)} onClick={() => window.open(link.url, '_blank')}
                              sx={{ fontSize: '0.6rem', height: 20, cursor: 'pointer' }} />
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <TextField size="small" value={newLinkNazwa} onChange={(e) => setNewLinkNazwa(e.target.value)} placeholder="Nazwa" sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }} />
                        <TextField size="small" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                          sx={{ flex: 1.5, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }} />
                        <IconButton size="small" onClick={handleAddLink} disabled={!newLinkUrl.trim()} color="primary"><AddIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={resetForm}>Anuluj</Button>
                      <Button size="small" variant="contained" startIcon={<SaveIcon sx={{ fontSize: 14 }} />} onClick={handleSaveEdit}>Zapisz</Button>
                    </Box>
                  </Box>
                ) : (
                  /* Display mode */
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{alt.nazwa}</Typography>
                        <Typography variant="body2" sx={{
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: baseCena !== undefined
                            ? alt.cena < baseCena ? theme.palette.success.main
                            : alt.cena > baseCena ? theme.palette.warning.main
                            : theme.palette.text.primary
                            : theme.palette.text.primary
                        }}>
                          {formatCurrency(alt.cena)}
                        </Typography>
                      </Box>
                      {alt.uwagi && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{alt.uwagi}</Typography>
                      )}
                      {(alt.linki || []).length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {alt.linki.map((link, i) => (
                            <Chip key={i} label={link.nazwa} size="small" onClick={() => window.open(link.url, '_blank')}
                              sx={{ fontSize: '0.55rem', height: 18, cursor: 'pointer', backgroundColor: alpha(theme.palette.primary.main, 0.08) }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Tooltip title="Edytuj">
                      <IconButton size="small" onClick={() => handleStartEdit(alt)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Usuń">
                      <IconButton size="small" onClick={() => handleDeleteAlt(alt.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {localAlts.length > 0 && <Divider sx={{ mb: 2 }} />}

        {/* Add new form (only when not editing) */}
        {editingId === null && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), border: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              Dodaj alternatywę
            </Typography>
            <TextField size="small" value={formNazwa} onChange={(e) => setFormNazwa(e.target.value)} placeholder="Nazwa (np. IKEA Kallax)" fullWidth />
            <TextField size="small" value={formCena || ''} onChange={(e) => setFormCena(e.target.value)} placeholder="Cena" type="number" fullWidth InputProps={{ endAdornment: <Typography variant="caption" sx={{ opacity: 0.5 }}>PLN</Typography> }} />
            <TextField size="small" value={formUwagi} onChange={(e) => setFormUwagi(e.target.value)} placeholder="Uwagi (opcjonalnie)" fullWidth />

            {/* Links */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <LinkIcon sx={{ fontSize: 12 }} /> Linki ({formLinki.length})
              </Typography>
              {formLinki.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {formLinki.map((link, i) => (
                    <Chip key={i} label={link.nazwa} size="small" onDelete={() => handleRemoveLink(i)} onClick={() => window.open(link.url, '_blank')}
                      sx={{ fontSize: '0.6rem', height: 20, cursor: 'pointer' }} />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <TextField size="small" value={newLinkNazwa} onChange={(e) => setNewLinkNazwa(e.target.value)} placeholder="Nazwa linku" sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }} />
                <TextField size="small" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL" sx={{ flex: 1.5, '& .MuiOutlinedInput-root': { fontSize: '0.75rem' } }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }} />
                <IconButton size="small" onClick={handleAddLink} disabled={!newLinkUrl.trim()} color="primary"><AddIcon sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </Box>

            <Button variant="outlined" size="small" onClick={handleAddAlt} disabled={!formNazwa.trim()} startIcon={<AddIcon />} sx={{ mt: 0.5, alignSelf: 'flex-start' }}>
              Dodaj
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Zamknij</Button>
        <Button variant="contained" onClick={handleSave}>
          Zapisz ({localAlts.length} alt.)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
