# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. **Port 3000 Already in Use**
```
Error: Something is already running on port 3000
```
**Solution:**
```bash
# Kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or use a different port
set PORT=3001 && npm start
```

### 2. **Backend Connection Issues**
```
Error: Network Error or CORS issues
```
**Solutions:**
- Ensure your Spring Boot backend is running on `http://localhost:8080`
- Check if CORS is properly configured in your backend
- Verify the proxy setting in `package.json`

### 3. **Module Not Found Errors**
```
Error: Cannot resolve module '@headlessui/react'
```
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 4. **Build Errors**
```
Error: Build failed with compilation errors
```
**Solution:**
```bash
# Clear cache and rebuild
npm run build -- --reset-cache
```

### 5. **Styling Issues**
```
Tailwind classes not working
```
**Solution:**
- Ensure `tailwind.config.js` is properly configured
- Check if `@tailwindcss/forms` is installed
- Restart the development server

### 6. **API Calls Failing**
```
Error: 404 or 500 errors from backend
```
**Solutions:**
- Check backend logs for errors
- Verify API endpoints match your backend implementation
- Test backend endpoints directly with Postman

## Quick Fixes

### Clear Everything and Start Fresh
```bash
# Stop the development server (Ctrl+C)
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Check if Backend is Running
```bash
# Test if backend is accessible
curl http://localhost:8080/customer/search
# Or open in browser: http://localhost:8080
```

### Environment Variables
Create `.env` file in `ui` directory:
```
REACT_APP_API_URL=http://localhost:8080
BROWSER=none
GENERATE_SOURCEMAP=false
```

## Performance Issues

### Slow Loading
- Check network tab in browser dev tools
- Ensure backend is responding quickly
- Consider adding loading states (already implemented)

### Memory Issues
- Close unnecessary browser tabs
- Restart the development server
- Check for memory leaks in browser dev tools

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### If Using Older Browsers
- Update your browser
- Check console for JavaScript errors
- Consider using polyfills if needed

## Development Tips

### Hot Reload Not Working
```bash
# Restart the development server
npm start
```

### CSS Changes Not Reflecting
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Check if Tailwind is properly configured

### API Changes Not Working
- Check if backend is updated
- Clear browser cache
- Check network tab for actual API calls

## Getting Help

### Check Browser Console
1. Open browser dev tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Check Terminal Output
- Look for compilation errors
- Check for warning messages
- Ensure no processes are blocking ports

### Verify File Structure
Ensure your `ui` directory has:
```
ui/
├── public/
├── src/
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Still Having Issues?

1. **Check the setup guide** in `SETUP_GUIDE.md`
2. **Verify all dependencies** are installed correctly
3. **Test with a fresh terminal** session
4. **Check if your backend APIs** are working with Postman
5. **Try building the project** with `npm run build` to see detailed errors

The application has been thoroughly tested and should work without issues when following the setup guide!
