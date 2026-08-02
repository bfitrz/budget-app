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
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  SwapHoriz as AltIcon,
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
  const [formNazwa, setFormNazwa] = useState('');
  const [formCena, setFormCena] = useState<number | string>('');
  const [formUwagi, setFormUwagi] = useState('');
  const [formLinki, setFormLinki] = useState<ItemLink[]>([]);
  const [newLinkNazwa, setNewLinkNazwa] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleOpen = () => {
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
    onSave([...alternatives, newAlt]);
    onClose();
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth TransitionProps={{ onEnter: handleOpen }}
      sx={{ '& .MuiDialog-paper': { maxHeight: { xs: '100dvh', sm: '85vh' }, height: { xs: '100dvh', sm: 'auto' }, m: { xs: 0, sm: 2 }, borderRadius: { xs: 0, sm: 2 } } }}>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AltIcon sx={{ fontSize: 20 }} />
          Nowa alternatywa{itemName ? ` — ${itemName}` : ''}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ overflowY: 'auto', flex: 1 }}>
        {baseCena !== undefined && (
          <Box sx={{ mb: 2.5, p: 1.5, borderRadius: 2, backgroundColor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
            <Typography variant="caption" color="text.secondary">Aktualna cena MAIN</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>{formatCurrency(baseCena)}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField size="small" value={formNazwa} onChange={(e) => setFormNazwa(e.target.value)} label="Nazwa" placeholder="np. IKEA Kallax, Allegro wariant" fullWidth autoFocus />
          <TextField size="small" value={formCena} onChange={(e) => setFormCena(e.target.value)} label="Cena (PLN)" type="number" fullWidth />
          <TextField size="small" value={formUwagi} onChange={(e) => setFormUwagi(e.target.value)} label="Uwagi (opcjonalnie)" fullWidth multiline rows={2} />

          {/* Links */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
              <LinkIcon sx={{ fontSize: 12 }} /> Linki ({formLinki.length})
            </Typography>
            {formLinki.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {formLinki.map((link, i) => (
                  <Chip key={i} label={link.nazwa} size="small" onDelete={() => handleRemoveLink(i)} onClick={() => window.open(link.url, '_blank')}
                    sx={{ fontSize: '0.65rem', height: 22, cursor: 'pointer' }} />
                ))}
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <TextField size="small" value={newLinkNazwa} onChange={(e) => setNewLinkNazwa(e.target.value)} placeholder="Nazwa linku" sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }} />
              <TextField size="small" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                sx={{ flex: 1.5, '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }} />
              <IconButton size="small" onClick={handleAddLink} disabled={!newLinkUrl.trim()} color="primary"><AddIcon sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', flexShrink: 0 }}>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={handleAddAlt} disabled={!formNazwa.trim()}>Dodaj alternatywę</Button>
      </DialogActions>
    </Dialog>
  );
}
