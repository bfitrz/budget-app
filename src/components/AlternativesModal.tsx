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
  Close as CloseIcon,
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
    const url = newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : newLinkUrl.trim() ? `https://${newLinkUrl.trim()}` : '';
    const pendingLinki = url ? [...formLinki, { nazwa: newLinkNazwa.trim() || url, url }] : formLinki;
    const newAlt: AlternativeItem = {
      id: generateId(),
      included: true,
      nazwa: formNazwa.trim(),
      cena: formCena,
      uwagi: formUwagi,
      linki: pendingLinki,
    };
    onSave([...alternatives, newAlt]);
    resetForm();
    onClose();
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
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AltIcon sx={{ fontSize: 20 }} />
          Alternatywy{itemName ? ` — ${itemName}` : ''}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1, maxHeight: '70vh' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Dodaj nową alternatywę cenową{baseCena !== undefined ? ` (aktualna cena MAIN: ${formatCurrency(baseCena)})` : ''}.
        </Typography>

        {/* Add form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), border: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Nowa alternatywa
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
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Zamknij</Button>
        <Button variant="contained" onClick={handleAddAlt} disabled={!formNazwa.trim()}>Dodaj</Button>
      </DialogActions>
    </Dialog>
  );
}
