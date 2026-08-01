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
  OpenInNew as OpenIcon,
  Link as LinkIcon,
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
  const [formCena, setFormCena] = useState(0);
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
    setFormCena(0);
    setFormUwagi('');
    setFormLinki([]);
    setNewLinkNazwa('');
    setNewLinkUrl('');
  };

  const handleAddAlt = () => {
    if (!formNazwa.trim()) return;
    const newAlt: AlternativeItem = {
      id: generateId(),
      included: true,
      nazwa: formNazwa.trim(),
      cena: formCena,
      uwagi: formUwagi,
      linki: formLinki,
    };
    setLocalAlts([...localAlts, newAlt]);
    resetForm();
  };

  const handleUpdateAlt = () => {
    if (!editingId || !formNazwa.trim()) return;
    setLocalAlts(localAlts.map((a) =>
      a.id === editingId ? { ...a, nazwa: formNazwa.trim(), cena: formCena, uwagi: formUwagi, linki: formLinki } : a
    ));
    resetForm();
  };

  const handleEditAlt = (alt: AlternativeItem) => {
    setEditingId(alt.id);
    setFormNazwa(alt.nazwa);
    setFormCena(alt.cena);
    setFormUwagi(alt.uwagi);
    setFormLinki(alt.linki || []);
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

  const allPrices = [baseCena || 0, ...localAlts.map((a) => a.cena)].filter((p) => p > 0);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AltIcon sx={{ fontSize: 20 }} />
        Alternatywy{itemName ? ` — ${itemName}` : ''}
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Price range info */}
        {localAlts.length > 0 && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.info.main, 0.06), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">Przedział cenowy:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(minPrice)} — {formatCurrency(maxPrice)}
            </Typography>
          </Box>
        )}

        {/* Base price */}
        {baseCena !== undefined && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Cena bazowa</Typography>
              <Typography variant="caption" color="text.secondary">Aktualnie wybrana</Typography>
            </Box>
            <Chip label={formatCurrency(baseCena)} size="small" color="primary" variant="outlined" />
          </Box>
        )}

        {/* Existing alternatives */}
        {localAlts.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {localAlts.map((alt) => (
              <Box
                key={alt.id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${editingId === alt.id ? theme.palette.primary.main : theme.palette.divider}`,
                  transition: 'border-color 0.1s ease',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{alt.nazwa}</Typography>
                    {alt.uwagi && <Typography variant="caption" color="text.secondary">{alt.uwagi}</Typography>}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={formatCurrency(alt.cena)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alt.cena <= (baseCena || 0)
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.warning.main, 0.1),
                        color: alt.cena <= (baseCena || 0) ? theme.palette.success.main : theme.palette.warning.main,
                      }}
                    />
                    <Tooltip title="Edytuj"><IconButton size="small" onClick={() => handleEditAlt(alt)}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                    <Tooltip title="Usuń"><IconButton size="small" onClick={() => handleDeleteAlt(alt.id)} sx={{ '&:hover': { color: theme.palette.error.main } }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                  </Box>
                </Box>
                {/* Links in alternative */}
                {alt.linki && alt.linki.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {alt.linki.map((link, i) => (
                      <Chip
                        key={i}
                        label={link.nazwa}
                        size="small"
                        icon={<OpenIcon sx={{ fontSize: '11px !important' }} />}
                        onClick={() => window.open(link.url, '_blank')}
                        sx={{ fontSize: '0.6rem', height: 20, cursor: 'pointer', backgroundColor: alpha(theme.palette.primary.main, 0.06) }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Add/Edit form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), border: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {editingId ? 'Edytuj alternatywę' : 'Dodaj alternatywę'}
          </Typography>
          <TextField size="small" value={formNazwa} onChange={(e) => setFormNazwa(e.target.value)} placeholder="Nazwa (np. IKEA Kallax)" fullWidth />
          <TextField size="small" value={formCena || ''} onChange={(e) => setFormCena(Number(e.target.value))} placeholder="Cena" type="number" fullWidth InputProps={{ endAdornment: <Typography variant="caption" sx={{ opacity: 0.5 }}>PLN</Typography> }} />
          <TextField size="small" value={formUwagi} onChange={(e) => setFormUwagi(e.target.value)} placeholder="Uwagi (opcjonalnie)" fullWidth />

          {/* Links for this alternative */}
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

          <Button
            variant="contained"
            size="small"
            onClick={editingId ? handleUpdateAlt : handleAddAlt}
            disabled={!formNazwa.trim()}
            sx={{ alignSelf: 'flex-start', mt: 0.5 }}
          >
            {editingId ? 'Zapisz zmiany' : 'Dodaj alternatywę'}
          </Button>
          {editingId && (
            <Button size="small" onClick={resetForm} sx={{ alignSelf: 'flex-start' }}>Anuluj edycję</Button>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={handleSave}>Zapisz ({localAlts.length} alt.)</Button>
      </DialogActions>
    </Dialog>
  );
}
