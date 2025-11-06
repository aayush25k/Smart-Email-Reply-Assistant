import { useState } from 'react'
import './App.css'
import { 
  Box, 
  Button, 
  CircularProgress, 
  Container, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Typography,
  Card,
  CardContent,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  ContentCopy, 
  Download, 
  AutoAwesome, 
  Email,
  Extension,
  CheckCircle
} from '@mui/icons-material';
import axios from 'axios';
import JSZip from 'jszip';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [downloading, setDownloading] = useState(false);

  const API_URL = "https://smart-email-reply-assistant.onrender.com/api/email/generate";
  // const API_URL = "http://localhost:8080/api/email/generate";

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(API_URL, {
       emailContent,
       tone 
      });
      setGeneratedReply(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
      showSnackbar('Email reply generated successfully!', 'success');
    } catch (error) {
      setError('Failed to generate email reply. Please try again');
      showSnackbar('Failed to generate email reply. Please try again', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      showSnackbar('Copied to clipboard!', 'success');
    } catch (err) {
      showSnackbar('Failed to copy to clipboard', 'error');
    }
  };

  const showSnackbar = (message, type) => {
    setSnackbar({ open: true, message, type });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const downloadExtension = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      
      // Fetch extension files from public folder (Vite serves public files from root)
      const [manifest, contentJs, contentCss] = await Promise.all([
        fetch('/extension/manifest.json').then(r => {
          if (!r.ok) throw new Error('Failed to fetch manifest.json');
          return r.text();
        }),
        fetch('/extension/content.js').then(r => {
          if (!r.ok) throw new Error('Failed to fetch content.js');
          return r.text();
        }),
        fetch('/extension/content.css').then(r => {
          if (!r.ok) throw new Error('Failed to fetch content.css');
          return r.text();
        })
      ]);

      // Add files to zip
      zip.file('manifest.json', manifest);
      zip.file('content.js', contentJs);
      zip.file('content.css', contentCss);

      // Generate zip file
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-reply-assistant-extension.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSnackbar('Extension downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading extension:', error);
      showSnackbar('Failed to download extension. Please check console for details.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app-container">
      <Container maxWidth="lg" className="main-container">
        {/* Header Section */}
        <Box className="header-section">
          <Box className="header-content">
            <AutoAwesome className="header-icon" />
            <Typography variant="h2" component="h1" className="main-title">
              Email Reply Assistant
            </Typography>
            <Typography variant="h6" className="subtitle">
              AI-Powered Smart Email Replies
            </Typography>
          </Box>
          
          {/* Download Extension Button */}
          <Card className="extension-card">
            <CardContent>
              <Box className="extension-header">
                <Extension className="extension-icon" />
                <Box>
                  <Typography variant="h6" className="extension-title">
                    Chrome Extension
                  </Typography>
                  <Typography variant="body2" className="extension-description">
                    Install our extension for seamless Gmail integration
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
                onClick={downloadExtension}
                disabled={downloading}
                className="download-button"
                fullWidth
              >
                {downloading ? 'Preparing Download...' : 'Download Extension'}
              </Button>
              <Typography variant="caption" className="install-instructions">
                After downloading, extract the ZIP file and load it in Chrome via chrome://extensions/ → Load Unpacked
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Main Content */}
        <Paper elevation={3} className="main-card">
          <CardContent>
            <Box className="input-section">
              <Box className="section-header">
                <Email className="section-icon" />
                <Typography variant="h5" className="section-title">
                  Generate Your Reply
                </Typography>
              </Box>

              <TextField 
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                label="Original Email Content"
                placeholder="Paste the email content you want to reply to..."
                value={emailContent || ''}
                onChange={(e) => setEmailContent(e.target.value)}
                className="email-input"
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Tone (Optional)</InputLabel>
                <Select
                  value={tone || ''}
                  label="Tone (Optional)"
                  onChange={(e) => setTone(e.target.value)}
                  className="tone-select"
                >
                  <MenuItem value="">Default</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!emailContent || loading}
                fullWidth
                size="large"
                className="generate-button"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              >
                {loading ? 'Generating Reply...' : 'Generate Reply'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
                {error}
              </Alert>
            )}

            {generatedReply && (
              <Box className="result-section">
                <Box className="section-header">
                  <CheckCircle className="section-icon success-icon" />
                  <Typography variant="h5" className="section-title">
                    Generated Reply
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  variant="outlined"
                  value={generatedReply || ''}
                  InputProps={{ readOnly: true }}
                  className="result-input"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<ContentCopy />}
                  onClick={handleCopy}
                  className="copy-button"
                  fullWidth
                >
                  Copy to Clipboard
                </Button>
              </Box>
            )}
          </CardContent>
        </Paper>

        {/* Footer */}
        <Box className="footer">
          <Typography variant="body2" className="footer-text">
            Powered by Google Gemini AI • Built with Spring Boot & React
          </Typography>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.type} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default App
