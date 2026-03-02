## Install helper
- CLI and WebUI
1. (script) Browse ``microsoft_root_url=https://services.mtps.microsoft.com/serviceapi/products`` for HelpViewer data products
2. Implement a solution allowing user to 'browse' the documentation products and installing them onto the program

### General TODO
1. Change project name to *[Visual Studio] HelpViewer Documentation Reader*
2. Include ``*.htm`` files into to the indexing and search process.
3. ``server.js`` implement a validity check of the ``index.json`` file in regards to the helpviewer_data, such as in the case where someone may add new datafiles that have not been indexed yet!
4. Restructure the functions, use file path join instead


- Issue: if the results batch is bigger than the browser can handle, then we should split them up in pages, where each page loads a certain amount of the results. Should we then store the results as a variable on server-end? Or should it search again and again and return according to page parameters?
