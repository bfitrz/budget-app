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
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Check as SaveIcon,
} from '@mui/icons-material';
import { ItemLink } from '@/types';

interface LinksModalProps {
  open: boolean;
  onClose: () => void;
  links: ItemLink[];
  onSave: (links: ItemLink[]) => void;
  itemName?: string;
}

export function LinksModal({ open, onClose, links, onSave, itemName }: LinksModalProps) {
  const theme = useTheme();
  const [localLinks, setLocalLinks] = useState<ItemLink[]>(links);
  const [newNazwa, setNewNazwa] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editNazwa, setEditNazwa] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleOpen = () => {
    setLocalLinks(links);
    setNewNazwa('');
    setNewUrl('');
    setEditingIndex(null);
  };

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    const url = newUrl.trim().startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`;
    const nazwa = newNazwa.trim() || url;
    setLocalLinks([...localLinks, { nazwa, url }]);
    setNewNazwa('');
    setNewUrl('');
  };

  const handleRemove = (index: number) => {
    setLocalLinks(localLinks.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditNazwa(localLinks[index].nazwa);
    setEditUrl(localLinks[index].url);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    if (!editUrl.trim()) return;
    const url = editUrl.trim().startsWith('http') ? editUrl.trim() : `https://${editUrl.trim()}`;
    const nazwa = editNazwa.trim() || url;
    setLocalLinks(localLinks.map((l, i) => i === editingIndex ? { nazwa, url } : l));
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSave = () => {
    onSave(localLinks);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleOpen }}
      sx={{ '& .MuiDialog-paper': { maxHeight: { xs: '100dvh', sm: '85vh' }, height: { xs: '100dvh', sm: 'auto' }, m: { xs: 0, sm: 2 }, borderRadius: { xs: 0, sm: 2 } } }}
    >
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon sx={{ fontSize: 20 }} />
          Linki{itemName ? ` — ${itemName}` : ''}
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1, overflowY: 'auto', flex: 1 }}>
        {/* Existing links */}
        {localLinks.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            {localLinks.map((link, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${editingIndex === index ? theme.palette.primary.main : theme.palette.divider}`,
                  transition: 'border-color 0.1s ease',
                  '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3) },
                }}
              >
                {editingIndex === index ? (
                  <>
                    <LinkIcon sx={{ fontSize: 16, color: theme.palette.primary.main, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        size="small"
                        value={editNazwa}
                        onChange={(e) => setEditNazwa(e.target.value)}
                        placeholder="Nazwa"
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8125rem' } }}
                      />
                      <TextField
                        size="small"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={handleEditKeyDown}
                        sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8125rem' } }}
                      />
                    </Box>
                    <Tooltip title="Zapisz (Enter)">
                      <IconButton
                        size="small"
                        onClick={handleSaveEdit}
                        sx={{ color: theme.palette.success.main }}
                      >
                        <SaveIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Anuluj (Esc)">
                      <IconButton
                        size="small"
                        onClick={handleCancelEdit}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <LinkIcon sx={{ fontSize: 16, color: theme.palette.primary.main, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          cursor: 'pointer',
                          color: theme.palette.primary.main,
                          '&:hover': { textDecoration: 'underline' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        {link.nazwa}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '0.65rem',
                        }}
                      >
                        {link.url}
                      </Typography>
                    </Box>
                    <Tooltip title="Otwórz">
                      <IconButton
                        size="small"
                        onClick={() => window.open(link.url, '_blank')}
                        sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                      >
                        <OpenIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edytuj">
                      <IconButton
                        size="small"
                        onClick={() => handleStartEdit(index)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.primary.main } }}
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Usuń">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(index)}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: theme.palette.error.main } }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 3, textAlign: 'center', mb: 2 }}>
            <LinkIcon sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Brak linków. Dodaj pierwszy poniżej.
            </Typography>
          </Box>
        )}

        {/* Add new link */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.03), border: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Dodaj link
          </Typography>
          <TextField
            size="small"
            value={newNazwa}
            onChange={(e) => setNewNazwa(e.target.value)}
            placeholder="Nazwa (np. Sklep meblowy)"
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8125rem' } }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://..."
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8125rem' } }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleAdd}
              disabled={!newUrl.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between', flexShrink: 0 }}>
        <Button onClick={onClose}>Zamknij</Button>
        <Button variant="contained" onClick={handleSave}>
          Zapisz ({localLinks.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* Inline display component for table cells */
interface LinksDisplayProps {
  links: ItemLink[];
  onManage: () => void;
}

export function LinksDisplay({ links, onManage }: LinksDisplayProps) {
  const theme = useTheme();

  if (links.length === 0) {
    return (
      <Tooltip title="Dodaj linki">
        <IconButton
          size="small"
          onClick={onManage}
          sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}
        >
          <LinkIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {links.slice(0, 2).map((link, i) => (
        <Chip
          key={i}
          label={link.nazwa}
          size="small"
          icon={<OpenIcon sx={{ fontSize: '12px !important' }} />}
          onClick={() => window.open(link.url, '_blank')}
          sx={{
            fontSize: '0.6rem',
            height: 22,
            maxWidth: 120,
            cursor: 'pointer',
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.14) },
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />
      ))}
      {links.length > 2 && (
        <Chip
          label={`+${links.length - 2}`}
          size="small"
          onClick={onManage}
          sx={{ fontSize: '0.6rem', height: 22, cursor: 'pointer' }}
        />
      )}
      <Tooltip title="Zarządzaj linkami">
        <IconButton
          size="small"
          onClick={onManage}
          sx={{ width: 20, height: 20, opacity: 0.5, '&:hover': { opacity: 1 } }}
        >
          <LinkIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
