import express from 'express';
import http from 'http';

const app = express();
const PORT = 4001;

// Serve a simple HTML page that redirects to the admin page
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="0; url=http://localhost:4000/admin">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Royal Chat - Admin Panel</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          color: #fff;
        }
        .loader {
          text-align: center;
        }
        .spinner {
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid #ffd700;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        h1 {
          font-size: 24px;
          margin: 0;
          color: #ffd700;
        }
        p {
          font-size: 14px;
          opacity: 0.8;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <h1>جاري التوجيه إلى لوحة التحكم...</h1>
        <p>Redirecting to Admin Panel...</p>
      </div>
      <script>
        // Immediate redirect
        window.location.href = 'http://localhost:4000/admin';
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n=================================`);
  console.log(`Admin server is running on port ${PORT}`);
  console.log(`Admin access: http://localhost:${PORT}`);
  console.log(`=================================\n`);
});

