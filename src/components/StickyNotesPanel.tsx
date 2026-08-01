import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  alpha,
  useTheme,
  Tooltip,
  Popover,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useNotesStore, NOTE_COLORS, StickyNote } from '@/store/notesStore';

function NoteCard({ note }: { note: StickyNote }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { updateNote, deleteNote, toggleDone } = useNotesStore();
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus new empty notes
  useEffect(() => {
    if (note.text === '' && textRef.current) {
      textRef.current.focus();
    }
  }, []);

  const bgColor = isDark ? alpha(note.color, 0.18) : alpha(note.color, 0.45);
  const borderColor = isDark ? alpha(note.color, 0.35) : alpha(note.color, 0.55);
  // Ensure text is always readable against the note background
  const textColor = isDark ? theme.palette.text.primary : '#1f1f1f';
  const placeholderColor = isDark ? alpha(theme.palette.text.secondary, 0.6) : 'rgba(0, 0, 0, 0.4)';
  const checkboxColor = isDark ? alpha(note.color, 0.7) : 'rgba(0, 0, 0, 0.45)';
  const checkboxCheckedColor = isDark ? note.color : 'rgba(0, 0, 0, 0.6)';

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        backgroundColor: bgColor,
        p: 1.5,
        pb: 1,
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(note.color, isDark ? 0.2 : 0.25)}`,
        },
        '&:hover .note-actions': {
          opacity: 1,
        },
      }}
    >
      {/* Top row: checkbox + delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Checkbox
          checked={note.done}
          onChange={() => toggleDone(note.id)}
          size="small"
          sx={{
            p: 0.25,
            color: checkboxColor,
            '&.Mui-checked': { color: checkboxCheckedColor },
            '&:hover': { backgroundColor: alpha(note.color, 0.1) },
          }}
        />
        <Box sx={{ flex: 1 }} />
        <Box
          className="note-actions"
          sx={{ opacity: 0, transition: 'opacity 0.15s', display: 'flex', gap: 0.25 }}
        >
          <Tooltip title="Kolor" arrow>
            <IconButton
              size="small"
              onClick={(e) => setColorAnchor(e.currentTarget)}
              sx={{ p: 0.25 }}
            >
              <CircleIcon sx={{ fontSize: 12, color: note.color }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Usuń" arrow>
            <IconButton
              size="small"
              onClick={() => deleteNote(note.id)}
              sx={{
                p: 0.25,
                color: isDark ? theme.palette.text.secondary : 'rgba(0,0,0,0.4)',
                '&:hover': { color: theme.palette.error.main },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Text area - inline edit */}
      <Box
        component="textarea"
        ref={textRef}
        value={note.text}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateNote(note.id, { text: e.target.value })}
        placeholder="Wpisz notatkę..."
        sx={{
          width: '100%',
          minHeight: '48px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          backgroundColor: 'transparent',
          color: textColor,
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          p: 0,
          textDecoration: note.done ? 'line-through' : 'none',
          opacity: note.done ? 0.55 : 1,
          '&::placeholder': {
            color: placeholderColor,
          },
        }}
      />

      {/* Color picker popover */}
      <Popover
        open={Boolean(colorAnchor)}
        anchorEl={colorAnchor}
        onClose={() => setColorAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '10px',
              p: 1,
              display: 'flex',
              gap: 0.5,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        {NOTE_COLORS.map((color) => (
          <IconButton
            key={color}
            size="small"
            onClick={() => {
              updateNote(note.id, { color });
              setColorAnchor(null);
            }}
            sx={{
              p: 0.5,
              border: note.color === color ? `2px solid ${color}` : '2px solid transparent',
              borderRadius: '50%',
              '&:hover': { backgroundColor: alpha(color, 0.15) },
            }}
          >
            <CircleIcon sx={{ fontSize: 18, color }} />
          </IconButton>
        ))}
      </Popover>
    </Box>
  );
}

export function StickyNotesPanel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { notes, addNote } = useNotesStore();

  const activeNotes = notes.filter((n) => !n.done);
  const doneNotes = notes.filter((n) => n.done);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.03em',
            color: theme.palette.text.primary,
          }}
        >
          📝 DO ZROBIENIA
        </Typography>
        <Tooltip title="Dodaj notatkę" arrow>
          <IconButton
            size="small"
            onClick={addNote}
            sx={{
              width: 26,
              height: 26,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <AddIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Notes list */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 1.5,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {activeNotes.length === 0 && doneNotes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary }}>
              Brak notatek
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: alpha(theme.palette.text.secondary, 0.7) }}>
              Kliknij + aby dodać
            </Typography>
          </Box>
        )}

        {activeNotes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}

        {doneNotes.length > 0 && (
          <>
            <Typography
              variant="overline"
              sx={{
                fontSize: '0.6rem',
                color: theme.palette.text.secondary,
                mt: 1,
                px: 0.5,
              }}
            >
              Zrobione ({doneNotes.length})
            </Typography>
            {doneNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}
